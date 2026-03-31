import { LocalStorage } from "node-localstorage";
import sqlite3 from "sqlite3";
import * as path from "path";
import moment from "moment";
import { ServerCommands } from "../../../app/services/settings/enums.ts";
export class DbService {
    constructor(settings, api) {
        this.tables = [];
        this.localStorage = new LocalStorage("./data/scratch");
        this.debug = false;
        this.settings = settings;
        this.api = api;
        this.tables = this.settings.getTables();
        this.api.init();
    }
    async load() {
        try {
            if (this.debug) {
                console.log(`[DB]: load`);
            }
            this.serialNumber = (await this.settings.getSerialNumber()).sn;
            const resetDb = false;
            const forceLoading = true;
            await this.initService(resetDb || forceLoading);
        }
        catch (error) {
            console.error("[DB]: load error", error);
            throw error;
        }
    }
    openDb() {
        return new Promise((resolve, reject) => {
            if (this.debug) {
                console.log(`[DB]: openDb`);
            }
            const __dirname = path.resolve();
            this.db = new sqlite3.Database(path.join(__dirname, "data", "db.sqlite"), sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    console.error("[DB]: error openDb: " + err.message);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async initService(forceLoading = false) {
        const networkStatus = true;
        const now = moment();
        const lastUpdate = [];
        if (this.debug) {
            console.log(`[DB]: init service`);
        }
        await this.openDb();
        const lastGlobalUpdate = this.localStorage.getItem(this.settings.getAppName() + "_lastglobalupdate") || now.date() - 1;
        const hoursWithoutUpdates = (Number(now) - Number(lastGlobalUpdate)) / (1000 * 60 * 60);
        if (!networkStatus || (hoursWithoutUpdates < 1 && !forceLoading)) {
            if (this.debug) {
                console.info("[DB]: Cached data");
            }
            return;
        }
        if (this.debug) {
            console.info("[DB]: Force data sync");
        }
        this.localStorage.setItem(this.settings.getAppName() + "_lastglobalupdate", String(now));
        if (this.debug) {
            console.info("[DB]: Promise all (expected load & syncData)");
        }
        await Promise.all(this.tables.map(async (table) => {
            lastUpdate[table] = this.localStorage.getItem(this.settings.getAppName() + "_" + table);
            if (this.debug) {
                console.info("[DB]: loadData", table);
            }
            await this.loadData(table, lastUpdate[table]);
            if (this.debug) {
                console.info("[DB]: synced", table);
            }
        }));
    }
    async loadData(table, lastUpdate) {
        const res = await this.api.get(table, lastUpdate, "read", this.serialNumber);
        await this.syncData({ [table]: res });
    }
    async syncData(data) {
        if (this.debug) {
            console.info("[DB]: entering sync data");
        }
        const table = Object.keys(data ?? {})[0];
        const res = (data ?? {})[table];
        if (this.debug) {
            console.info("[DB]: Db Sync records ready ", table);
        }
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (
      ${res.tableDefinition.map((el) => `${el.name} ${el.type} ${el.primary_key ? "PRIMARY KEY" : ""}`).join(", ")}
    )`;
        try {
            await new Promise((resolve, reject) => {
                this.db.run(createTableQuery, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    else {
                        if (this.debug) {
                            console.log(`[DB] Table ${table} created or exists`);
                        }
                        resolve();
                    }
                });
            });
            if (res.items) {
                for (const row of res.items) {
                    if (row.id) {
                        if (row.deleted) {
                            await new Promise((resolve, reject) => {
                                this.db.run(`DELETE FROM ${table} WHERE id=?`, +row.id, (err) => {
                                    if (err) {
                                        console.error(err.message);
                                        reject(err);
                                    }
                                    else {
                                        if (this.debug) {
                                            console.log(`[DB] Row(s) deleted ID ${row.id}`);
                                        }
                                        resolve();
                                    }
                                });
                            });
                        }
                        else {
                            const cols = Object.keys(row);
                            const values = cols.map((key) => row[key]);
                            const placeholders = cols.map(() => "?").join(", ");
                            const query = `INSERT OR REPLACE INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`;
                            await new Promise((resolve, reject) => {
                                this.db.run(query, values, (err) => {
                                    if (err) {
                                        console.log("[DB]: syncData err ", err, query);
                                        reject(err);
                                    }
                                    else {
                                        resolve();
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }
        catch (err) {
            console.error("[DB]: Error during syncData", err);
            throw err;
        }
    }
    async getItem(table, value, column = "id") {
        if (value) {
            const query = `SELECT * from ${table} WHERE ${column}=(?)`;
            return new Promise((resolve, reject) => {
                this.db.get(query, [value], (err, row) => {
                    if (err) {
                        console.log("[DB]: getItem err ", query, err);
                        reject(err);
                    }
                    else {
                        resolve(row);
                    }
                });
            });
        }
        else {
            return undefined;
        }
    }
    async getItems(table, value = null, column = "id") {
        const query = `SELECT * from ${table}` + (value ? ` WHERE ${column}=(?)` : "");
        const where = value ? [value] : [];
        return new Promise((resolve, reject) => {
            this.db.all(query, where, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async findParent(id) {
        if (id) {
            const query = `
        SELECT ROOMS.*, ROOMS.name AS roomName, ROOMS.locationId AS roomLocationId, 
        POTS.*, POTS.name AS potName, POTS.locationId AS potLocationId, 
        LOCATIONS.* FROM LOCATIONS
        LEFT JOIN POTS ON POTS.locationId = LOCATIONS.id AND LOCATIONS.parent > 0
        LEFT JOIN ROOMS ON ROOMS.locationId = LOCATIONS.id AND LOCATIONS.parent = 0
        WHERE LOCATIONS.id=(?)`;
            return new Promise((resolve, reject) => {
                this.db.get(query, [id], (err, row) => {
                    if (err) {
                        console.log("[DB]:", err);
                        reject(err);
                    }
                    else {
                        resolve(row);
                    }
                });
            });
        }
        else {
            return undefined;
        }
    }
    async findTable(table) {
        if (table) {
            const query = `SELECT count(*) as found FROM sqlite_master WHERE type='table' AND name='${table}';`;
            return new Promise((resolve, reject) => {
                this.db.get(query, [], (err, row) => {
                    if (err) {
                        console.log("[DB]:", err);
                        reject(err);
                    }
                    else {
                        resolve(row);
                    }
                });
            });
        }
        else {
            return undefined;
        }
    }
    closeDb() {
        this.db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            else {
                console.log("[DB]: Close the database connection.");
            }
        });
    }
    async putItem(table, item) {
        const lastUpdate = this.localStorage.getItem(this.settings.getAppName() + "_" + table);
        const endpoint = "endpoint";
        const action = ServerCommands.LOG;
        return new Promise((resolve, reject) => {
            this.api
                .post(endpoint, lastUpdate, action, item, this.serialNumber)
                .then((response) => {
                if (response) {
                    const row = response;
                    const values = [];
                    const cols = [];
                    if (row) {
                        Object.keys(row).forEach((key) => {
                            cols.push(key);
                            values.push(row[key]);
                        });
                        const query = `INSERT or REPLACE into ${table}(${cols.join(", ")}) values (${cols.map(() => "?").join(", ")})`;
                        this.db.run(query, values, (err) => {
                            if (err) {
                                console.log("[DB]: INSERT or REPLACE err", err);
                                reject(err);
                            }
                            else {
                                resolve();
                            }
                        });
                    }
                    else {
                        console.log("[DB]: API POST response void", response);
                        resolve();
                    }
                }
                else {
                    console.log("[DB]: API POST response undefined", response);
                    resolve();
                }
            })
                .catch((err) => {
                console.log("[DB]: API POST error", err);
                reject(err);
            });
        });
    }
    async logItem(table, item) {
        const lastUpdate = this.localStorage.getItem(`${this.settings.getAppName()}_${table}`);
        const endpoint = "endpoint";
        const action = ServerCommands.LOG;
        try {
            const response = await this.api.post(endpoint, lastUpdate, action, item, this.serialNumber);
            if (response) {
                if (this.debug) {
                    console.log("Logging Data:", {
                        endpoint,
                        lastUpdate,
                        action,
                        item,
                        serialNumber: this.serialNumber,
                        response,
                    });
                }
                const values = [];
                const cols = [];
                Object.keys(response).forEach((key) => {
                    cols.push(key);
                    values.push(response[key]);
                });
                // Process values and cols as needed
            }
            else {
                console.log("[DB]: logItem API POST returned an empty response.");
            }
        }
        catch (err) {
            console.error("[DB]: logItem API POST error:", err);
            throw err;
        }
    }
    async deleteItem(objectStore, itemToDelete) {
        return this.api.delete(objectStore, itemToDelete).then((item) => {
            if (item.synced !== 0) {
                return;
            }
            else {
                if (this.debug) {
                    console.info("[DB]: item still not synced, don't remove from db but set to deleted:1. Table: \"" +
                        objectStore +
                        '" id:' +
                        item.id);
                }
                item.deleted = 1;
                // Here you can handle setting item.deleted = 1 if needed.
            }
        });
    }
    ////////////////////////////////////////////////
    //                                            //
    //    Db Sync Offline to Remote and Clean     //
    //                                            //
    ////////////////////////////////////////////////
    async syncAndClean(networkStatus) {
        if (networkStatus) {
            await this.syncStoredItems();
            await this.removeDeletedItem();
            if (this.debug) {
                console.info("[DB]: Db cleaned");
            }
        }
    }
    async syncStoredItems() {
        if (this.debug) {
            console.info("[DB]: Sync stored items with remote");
        }
        for (const table of this.tables) {
            const items = await this.getItemsToBeSynced(table);
            if (items.length) {
                if (this.debug) {
                    console.info('[DB]: Items to sync. Table:"' + table + '" items:', items);
                }
                await Promise.all(items.map((item) => this.putItem(table, item)));
            }
        }
    }
    getItemsToBeSynced(table) {
        const query = `SELECT * from ${table} WHERE sinced=(0)`;
        return new Promise((resolve, reject) => {
            this.db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async removeDeletedItem() {
        if (this.debug) {
            console.info("[DB]: Sync deleted items with remote then remove");
        }
        for (const table of this.tables) {
            const items = await this.getItemsToBeRemoved(table);
            if (items.length) {
                if (this.debug) {
                    console.info('[DB]: items to remove. Table:"' + table + '" items:', items);
                }
                await Promise.all(items.map((item) => this.deleteItem(table, item)));
            }
        }
    }
    getItemsToBeRemoved(objectStore) {
        // Implement the logic to get items to be removed.
        console.log(objectStore);
        return Promise.resolve([]);
    }
}
export default DbService;
