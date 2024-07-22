import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from '../api/api.service';
import { SettingsService } from '../settings/settings.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
    providedIn: 'root'
})
export class DbService {

    private db: IDBDatabase;
    private tables = [];
    resetDb;
    forceLoading;

    constructor(
        public loadingController: LoadingController,
        private toastService: ToastService,
        private appSettings: SettingsService,
        public api: ApiService
    ) {
        this.tables = this.appSettings.datatables;
        this.api.init();
        this.resetDb = this.appSettings.resetDb;
        this.forceLoading = this.appSettings.forceLoading;
    }

    async load(): Promise<any> {

        return new Promise(resolve => {
            const resetDb = this.resetDb, forceLoading = this.forceLoading;
            this.initDb(resetDb).then(() => {
                this.initService((resetDb ? resetDb : forceLoading)).then(() => {
                    this.api.networkService.status.subscribe((networkStatus) => {
                        console.info('[DB]: Network status: ' + (networkStatus ? 'Online' : 'Offline'));
                        this.syncAndClean(networkStatus).then(() => {
                            resolve();
                        });
                    });
                });
            });
        });
    }

    async deleteDb(): Promise<any> {
        this.toastService.pushMessage('Database reset');
        this.toastService.presentToast();
        localStorage.clear();
        const request = indexedDB.deleteDatabase(this.appSettings.appName);
        return new Promise(function(resolve, reject) {
            request.onsuccess = function() { console.info('[DB]: Delete db Ok'); resolve(request.result); };
            request.onerror = function() { console.error('[DB]: Delete db Error'); reject(request.error); };
        });
    }

    private createDb(): Promise<void> {
        if (this.db) { this.db.close(); }
        return new Promise(resolve => {
            const openRequest = indexedDB.open(this.appSettings.appName);
            openRequest.onupgradeneeded = event => {
                const target: any = event.target, db = target.result, storeObjects = [];
                this.tables.map(table => {
                    storeObjects['store' + table] = db.createObjectStore(table, {keyPath: 'id', autoIncrement: true});
                    storeObjects['store' + table].createIndex('id', ['id']);
                    storeObjects['store' + table].createIndex('synced', ['synced'], { unique: false });
                    storeObjects['store' + table].createIndex('deleted', ['deleted'], { unique: false });
                    storeObjects['store' + table].createIndex('enabled, deleted', ['enabled', 'deleted']);
                    if (table == 'doses') {
                        storeObjects['store' + table].createIndex('enabled, deleted, id_calendar', ['enabled', 'deleted', 'id_calendar']);
                    }
                });
                console.info('[DB]: Db forged');
            };
            openRequest.onsuccess = (event) => {
                this.db = (<any>event.target).result;
                this.db.onerror = event => { console.error('[DB]: error createDb: ' + event); };
                console.info('[DB]: Db Ready');
                resolve();
            };
        });
    }

    async initDb(resetDb= false): Promise<any> {
        return new Promise<void>(resolve => {
            if (resetDb) {
                console.info('[DB]: Delete db');
                this.deleteDb().then(() => { resolve(); });
            } else {
                console.info('[DB]: Delete db not required');
                resolve();
            }
        });
    }

    async initService(forceLoading= false): Promise<void> {
        const networkStatus = this.api.networkService.status._value, date = new Date(), now = Date.now(), lastUpdate = [], promises = [];

        const promise = this.createDb();

        const lastGlobalUpdate = ( localStorage.getItem(this.appSettings.appName + '_lastglobalupdate') || date.getDate() - 1 );
        const hoursWithoutUpdates = (Number(now) - Number(lastGlobalUpdate)) / (1000 * 60 * 60);

        if (!networkStatus || (hoursWithoutUpdates < 1 && forceLoading == false)) {
            console.info('[DB]: Cached data');
            return promise;
        }

        console.info('[DB]: Force data sync');
        localStorage.setItem(this.appSettings.appName + '_lastglobalupdate', String(now));
        const loading = await this.loadingController.create({ message: 'Loading' });
        loading.present();

        return promise.then(() => {
            return Promise.all(this.tables.map( (table) => {
                lastUpdate[table] = localStorage.getItem(this.appSettings.appName + '_' + table);
                return this.loadData(table, lastUpdate[table]);
            }));
        }).then((results) => {
            this.syncData(results);
            loading.dismiss();
            return;
        });
    }

    async loadData(table, lastUpdate): Promise<any> {
        return new Promise((resolve, reject) => {
            const params = { lastUpdate : lastUpdate };
            
            this.api.get(table, params)
            .then((res) => {
                resolve({[table] : res});
            });
        });
    }

    async syncData(data) {
        return new Promise((resolve) => {
            data.map((data) => {
                const table = Object.keys(data)[0];
                const res = data[table];
                //console.info("[DB]: Db Sync records ready ",data, table, res)
                const tx = this.db.transaction(table, 'readwrite');
                const store = tx.objectStore(table);
                let lastUpdate;
                if (res.items.length) {
                    // var store = transaction.objectStore(...);
                    // return Promise.all(records.map( record => { return store.add(record); }))
                    //    .then( function () { return transaction.complete; });
                    const promises = res.items.map(row => {
                        if (row.id) {
                            let promise;
                            if (row.deleted) {
                                promise = store.delete(row.id);
                            } else {
                                promise = store.put(row);
                            }
                            promise.onsuccess = function(e) {
                                //console.info('[DB]: Success syncing db table: "'+table+'", item:',e);
                            };
                            promise.onerror = function(e) {
                                //console.error('[DB]: Error syncing db table: "'+table+'", item:',e);
                            };
                        }
                        lastUpdate = ( (row.lastUpdate > lastUpdate) || !lastUpdate ? row.lastUpdate : lastUpdate);
                        tx.oncomplete = e => {
                            if (lastUpdate) {
                                localStorage.setItem(this.appSettings.appName + '_' + table, lastUpdate);
                            }

                        };
                    });
                } else { resolve(); }
            });
        });
    }

    getItem(objectStore, id, column= 'id'): Promise<any> {
        const tx = this.db.transaction(objectStore, 'readonly');
        const store = tx.objectStore(objectStore);
        const dataIndex: any = store.index(column);
        const promise = new Promise<any>(resolve => {
            if (id) {
                dataIndex.get(id).onsuccess = e => resolve(e.target.result);
            }
        });
        return promise;
    }

    getItems(objectStore, column= 'enabled, deleted'): Promise<any> {
        // console.info('[DB]: getItems. Table: ' + objectStore);
        const tx = this.db.transaction(objectStore, 'readonly');
        const store = tx.objectStore(objectStore);
        const dataIndex: any = store.index(column);
        const promise = new Promise<any>(resolve => {
            dataIndex.getAll([1, 0]).onsuccess = e => {
                resolve(e.target.result);}
        }).catch(err => console.error(err));
        return promise;
    }

    getConnectedItems(objectStore, column, id_rif): Promise<any> {
        const tx = this.db.transaction(objectStore, 'readonly');
        const store = tx.objectStore(objectStore);
        const dataIndex: any = store.index(column);
        const promise = new Promise<any>(resolve => {
            dataIndex.getAll([1, 0, id_rif]).onsuccess = e => {
                resolve(e.target.result);};
        });
        return promise;
    }

    // putItem(objectStore, item:any): Promise<void>{
    //     return new Promise(resolve => {
    //         if(!item.id){ delete item.id; }
    //         Object.keys(item).forEach((key)=>{
    //             if(!isNaN(item[key])){
    //                 item[key] = Number(item[key]);
    //             }
    //         })
    //         let lastUpdate = localStorage.getItem(this.appSettings.appName+'_'+objectStore);
    //         let params = { lastUpdate : lastUpdate }
    //         this.api.post(objectStore, item, params)
    //             .then((response) => {
    //                 const tx = this.db.transaction(objectStore, 'readwrite');
    //                 const store = tx.objectStore(objectStore);
    //                 let promise = store.put(response.item);
    //                 promise.onsuccess = function(e){
    //                     resolve();
    //                 };
    //                 promise.onerror = function(e){
    //                     console.error('[DB]: Error adding: '+e);
    //                 };
    //             });
    //     });
    // }

    putItems(objectStore, items: any): Promise<void> {
        return new Promise(resolve => {
            items.map(item => {
                if (!item.id) { delete item.id; }
                Object.keys(item).forEach((key) => {
                    if (!isNaN(item[key])) {
                        item[key] = Number(item[key]);
                    }
                });
            });

            const lastUpdate = localStorage.getItem(this.appSettings.appName + '_' + objectStore);
            const params = { lastUpdate : lastUpdate };
            this.api.post(objectStore, items, params)
                .then((response) => {
                    const tx = this.db.transaction(objectStore, 'readwrite');
                    const store = tx.objectStore(objectStore);
                    response.items.map(item => {
                        const promise = store.put(item);
                        promise.onsuccess = function(e) {
                            resolve();
                        };
                        promise.onerror = function(e) {
                            console.error('[DB]: Error adding: ' + e);
                        };
                    });
                });
        });
    }

    deleteItem(objectStore, item: any): Promise<void> {
        return new Promise(resolve => {
            this.api.delete(objectStore, item)
                .then((item) => {
                    const tx = this.db.transaction(objectStore, 'readwrite');
                    const store = tx.objectStore(objectStore);
                    if (item.synced != 0) {
                        const objectStoreRequest = store.delete(item.id);
                        objectStoreRequest.onsuccess = function(event) {
                            console.info('[DB]: item deleted. Table: "' + objectStore + '" id:' + item.id);
                            resolve();
                        };
                    } else {
                        console.info('[DB]: item still not synced, don\'t remove from db but set to deleted:1. Table: "' + objectStore + '" id:' + item.id);
                        item.deleted = 1;
                        const tx = this.db.transaction(objectStore, 'readwrite');
                        const store = tx.objectStore(objectStore);
                        const promise = store.put(item);
                        promise.onsuccess = function(e) {
                            resolve();
                        };
                        promise.onerror = function(e) {
                            console.error('[DB]: Error adding: ' + e);
                        };
                    }
                });
        });
    }

    ////////////////////////////////////////////////
    //                                            //
    //    Db Sync Offline to Remote and Clean     //
    //                                            //
    ////////////////////////////////////////////////

    syncAndClean(networkStatus): Promise<any> {
        const promise = new Promise<any>(resolve => {
            if (networkStatus) {
                this.toastService.pushMessage('Database sync and cleaning');
                this.syncStoredItems().then(() => {
                    this.removeDeletedItem().then(() => {
                        console.info('[DB]: Db cleaned');
                        resolve();
                    });
                });
            } else {
                resolve();
            }
        });
        return promise;
    }

    syncStoredItems(): Promise<any> {
        const promise = new Promise<any>(resolve => {
            console.info('[DB]: Sync stored items with remote');
            this.tables.map((table) => {
                this.getItemsToBeSynced(table).then((items) => {
                    if (items.length) {
                        console.info('[DB]: Items to sync. Table:"' + table + '" items:', items);
                        items.map((item) => {
                            const saveItem = Array();
                            saveItem.push(item);
                            this.putItems(table, saveItem).then(() => { resolve(); });
                        });
                    } else { resolve(); }
                });
            });
        });
        return promise;
    }

    getItemsToBeSynced(objectStore): Promise<any> {
        const tx = this.db.transaction(objectStore, 'readonly');
        const store = tx.objectStore(objectStore);
        const dataIndex: any = store.index('synced');
        const promise = new Promise<any>(resolve => {
            dataIndex.getAll(0).onsuccess = (e) => {
                resolve(e.target.result);
            };
        });
        return promise;
    }

    removeDeletedItem(): Promise<void> {
        const promise = new Promise<any>(resolve => {
            console.info('[DB]: Sync deleted items with remote then remove');
            this.tables.map((table) => {
                this.getItemsToBeRemoved(table).then((items) => {
                    if (items.length) {
                        console.info('[DB]: items to remove. Table:"' + table + '" items:', items);
                        items.map((item) => {
                            this.deleteItem(table, item).then(() => { resolve(); });
                        });
                    } else { resolve(); }
                });
            });
        });
        return promise;
    }

    getItemsToBeRemoved(objectStore): Promise<any> {
        // console.info('[DB]: getItemsToBeRemoved. Table:' + objectStore);
        const tx = this.db.transaction(objectStore, 'readonly');
        const store = tx.objectStore(objectStore);
        const dataIndex: any = store.index('deleted');
        const promise = new Promise<any>(resolve => {
            dataIndex.getAll(1).onsuccess = (e) => {
                resolve(e.target.result);
            };
        });
        return promise;
    }
}
