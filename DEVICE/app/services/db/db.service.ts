import { LocationInterface } from "../../interfaces/location";
import { RoomInterface } from "../../interfaces/room";
import { PotInterface } from "../../interfaces/pot";

import { LocalStorage } from "node-localstorage";
import sqlite3 from "sqlite3";
import * as path from "path";
import moment from "moment";

import { ServerCommands } from "../../../app/services/settings/enums";

export class DbService {
  private settings;
  private api;
  private db;
  private serialNumber;
  private tables: string[] = [];
  private localStorage = new LocalStorage("./data/scratch");
  private debug = false;

  constructor(settings, api) {
    this.settings = settings;
    this.api = api;
    this.tables = this.settings.getTables();
    this.api.init();
  }

  public async load(): Promise<void> {
    try {
      if (this.debug) {
        console.log(`[DB]: load`);
      }
  
      this.serialNumber = (await this.settings.getSerialNumber()).sn;
  
      const resetDb = false;
      const forceLoading = true;
  
      await this.initService(resetDb || forceLoading);
    } catch (error) {
      console.error("[DB]: load error", error);
      throw error;
    }
  }

  private openDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.debug) {
        console.log(`[DB]: openDb`);
      }
      const __dirname = path.resolve();
      this.db = new sqlite3.Database(
        path.join(__dirname, "data", "db.sqlite"),
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err) {
            console.error("[DB]: error openDb: " + err.message);
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  private async initService(forceLoading = false): Promise<void> {
    const networkStatus = true;
    const now = moment();
    const lastUpdate = [];
    
    if (this.debug) {
      console.log(`[DB]: init service`);
    }
    
    await this.openDb();

    const lastGlobalUpdate =
      this.localStorage.getItem(
        this.settings.getAppName() + "_lastglobalupdate",
      ) || now.date() - 1;
    const hoursWithoutUpdates =
      (Number(now) - Number(lastGlobalUpdate)) / (1000 * 60 * 60);

    if (!networkStatus || (hoursWithoutUpdates < 1 && !forceLoading)) {
      if (this.debug) {
        console.info("[DB]: Cached data");
      }
      return;
    }

    if (this.debug) {
      console.info("[DB]: Force data sync");
    }

    this.localStorage.setItem(
      this.settings.getAppName() + "_lastglobalupdate",
      String(now),
    );

    if (this.debug) {
      console.info("[DB]: Promise all (expected load & syncData)");
    }

    await Promise.all(
      this.tables.map(async (table: string) => {
        lastUpdate[table] = this.localStorage.getItem(
          this.settings.getAppName() + "_" + table,
        );
        if (this.debug) {
          console.info("[DB]: loadData", table);
        }
        await this.loadData(table, lastUpdate[table]);
        if (this.debug) {
          console.info("[DB]: synced", table);
        }
      }),
    );
  }

  private async loadData(table: string, lastUpdate: Date): Promise<void> {
    
      const res = await this.api.get(table, lastUpdate, "read", this.serialNumber);
      await this.syncData({ [table]: res });
    
  }

  private async syncData(data: any): Promise<void> {
    if (this.debug) {
      console.info("[DB]: entering sync data");
    }
    
    const table = Object.keys(data)[0];
    const res = data[table];
    
    if (this.debug) {
      console.info("[DB]: Db Sync records ready ", table);
    }

    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (
      ${res.tableDefinition.map((el: any) => `${el.name} ${el.type} ${el.primary_key ? "PRIMARY KEY" : ""}`).join(", ")}
    )`;

    try {
      await new Promise<void>((resolve, reject) => {
        this.db.run(createTableQuery, (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
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
              await new Promise<void>((resolve, reject) => {
                this.db.run(`DELETE FROM ${table} WHERE id=?`, +row.id, (err) => {
                  if (err) {
                    console.error(err.message);
                    reject(err);
                  } else {
                    if (this.debug) {
                      console.log(`[DB] Row(s) deleted ID ${row.id}`);
                    }
                    resolve();
                  }
                });
              });
            } else {
              const cols = Object.keys(row);
              const values = cols.map((key) => row[key]);
              const placeholders = cols.map(() => "?").join(", ");
              const query = `INSERT OR REPLACE INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`;

              await new Promise<void>((resolve, reject) => {
                this.db.run(query, values, (err) => {
                  if (err) {
                    console.log("[DB]: syncData err ", err, query);
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("[DB]: Error during syncData", err);
      throw err;
    }
  }

  public async getItem(
    table: string,
    value: string | number,
    column: string = "id",
  ): Promise<LocationInterface | RoomInterface | PotInterface | null> {
    if (value) {
      const query = `SELECT * from ${table} WHERE ${column}=(?)`;
      return new Promise<LocationInterface | RoomInterface | PotInterface>((resolve, reject) => {
        this.db.get(query, [value], (err, row) => {
          if (err) {
            console.log("[DB]: getItem err ", query, err);
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    } else {
      return null;
    }
  }

  public async getItems(
    table: string,
    value: number | null = null,
    column: string = "id",
  ): Promise<LocationInterface[] | RoomInterface[]> {
    const query = `SELECT * from ${table}` + (value ? ` WHERE ${column}=(?)` : '');
    const where = value ? [value] : [];
    return new Promise<LocationInterface[] | RoomInterface[]>((resolve, reject) => {
      this.db.all(query, where, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public async findParent(id: number): Promise<RoomInterface | PotInterface | LocationInterface | null> {
    if (id) {
      const query = `
        SELECT ROOMS.*, ROOMS.name AS roomName, ROOMS.locationId AS roomLocationId, 
        POTS.*, POTS.name AS potName, POTS.locationId AS potLocationId, 
        LOCATIONS.* FROM LOCATIONS
        LEFT JOIN POTS ON POTS.locationId = LOCATIONS.id AND LOCATIONS.parent > 0
        LEFT JOIN ROOMS ON ROOMS.locationId = LOCATIONS.id AND LOCATIONS.parent = 0
        WHERE LOCATIONS.id=(?)`;
      return new Promise<RoomInterface | PotInterface>((resolve, reject) => {
        this.db.get(query, [id], (err, row) => {
          if (err) {
            console.log("[DB]:", err);
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    } else {
      return null;
    }
  }

  public async findTable(table: string): Promise<any> {
    if (table) {
      const query = `SELECT count(*) as found FROM sqlite_master WHERE type='table' AND name='${table}';`;
      return new Promise<any>((resolve, reject) => {
        this.db.get(query, [], (err, row) => {
          if (err) {
            console.log("[DB]:", err);
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    } else {
      return null;
    }
  }

  public closeDb(): void {
    this.db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("[DB]: Close the database connection.");
      }
    });
  }

  public async putItem(table: string, item: any): Promise<void> {
    const lastUpdate = this.localStorage.getItem(
      this.settings.getAppName() + "_" + table,
    );
    const endpoint = "endpoint";
    const action = ServerCommands.LOG;

    return new Promise<void>((resolve, reject) => {
      this.api
        .post(endpoint, lastUpdate, action, item, this.serialNumber)
        .then((response: any) => {
          if (response) {
            const row = response;
            const values: any[] = [];
            const cols: string[] = [];
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
                } else {
                  resolve();
                }
              });
            } else {
              console.log("[DB]: API POST response void", response);
              resolve();
            }
          } else {
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

  public async logItem(table: string, item: any): Promise<void> {
    const lastUpdate = this.localStorage.getItem(
      this.settings.getAppName() + "_" + table,
    );
    const endpoint = "endpoint";
    const action = ServerCommands.LOG;

    return new Promise<void>((resolve, reject) => {
      this.api
        .post(endpoint, lastUpdate, action, item, this.serialNumber)
        .then((response: any) => {
          if (response) {
            if (this.debug) {
              console.log(endpoint, lastUpdate, action, item, this.serialNumber, response);
            }
            const row = response;
            const values: any[] = [];
            const cols: string[] = [];
            if (row) {
              Object.keys(row).forEach((key) => {
                cols.push(key);
                values.push(row[key]);
              });
              resolve();
            } else {
              console.log("[DB]: logItem API POST response void", response);
              resolve();
            }
          } else {
            console.log("[DB]: logItem API POST response undefined", response);
            resolve();
          }
        })
        .catch((err) => {
          console.log("[DB]: logItem API POST error", err);
          reject(err);
        });
    });
  }

  public async deleteItem(objectStore: string, itemToDelete: any): Promise<void> {
    return this.api.delete(objectStore, itemToDelete).then((item: any) => {
      if (item.synced !== 0) {
        return;
      } else {
        if (this.debug) {
          console.info(
            "[DB]: item still not synced, don't remove from db but set to deleted:1. Table: \"" +
              objectStore +
              '" id:' +
              item.id,
          );
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

  public async syncAndClean(networkStatus: boolean): Promise<void> {
    if (networkStatus) {
      await this.syncStoredItems();
      await this.removeDeletedItem();
      if (this.debug) {
        console.info("[DB]: Db cleaned");
      }
    }
  }

  private async syncStoredItems(): Promise<void> {
    if (this.debug) {
      console.info("[DB]: Sync stored items with remote");
    }

    for (const table of this.tables) {
      const items = await this.getItemsToBeSynced(table);
      if (items.length) {
        if (this.debug) {
          console.info('[DB]: Items to sync. Table:"' + table + '" items:', items);
        }
        await Promise.all(items.map(item => this.putItem(table, item)));
      }
    }
  }

  private getItemsToBeSynced(table: string): Promise<any[]> {
    const query = `SELECT * from ${table} WHERE sinced=(0)`;
    return new Promise<any[]>((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  private async removeDeletedItem(): Promise<void> {
    if (this.debug) {
      console.info("[DB]: Sync deleted items with remote then remove");
    }

    for (const table of this.tables) {
      const items = await this.getItemsToBeRemoved(table);
      if (items.length) {
        if (this.debug) {
          console.info('[DB]: items to remove. Table:"' + table + '" items:', items);
        }
        await Promise.all(items.map(item => this.deleteItem(table, item)));
      }
    }
  }

  private getItemsToBeRemoved(objectStore: string): Promise<any[]> {
    // Implement the logic to get items to be removed.
    return Promise.resolve([]);
  }
}

export default DbService;
