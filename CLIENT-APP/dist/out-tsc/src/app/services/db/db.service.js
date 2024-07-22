import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from '../api/api.service';
import { SettingsService } from '../settings/settings.service';
import { ToastService } from '../toast/toast.service';
var DbService = /** @class */ (function () {
    function DbService(loadingController, toastService, appSettings, api) {
        this.loadingController = loadingController;
        this.toastService = toastService;
        this.appSettings = appSettings;
        this.api = api;
        this.tables = [];
        this.tables = this.appSettings.datatables;
        this.api.init();
    }
    DbService.prototype.load = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var resetDb = false, forceLoading = false;
                        _this.initDb(resetDb).then(function () {
                            _this.initService((resetDb ? resetDb : forceLoading)).then(function () {
                                _this.api.networkService.status.subscribe(function (networkStatus) {
                                    console.info('[DB]: Network status: ' + (networkStatus ? 'Online' : 'Offline'));
                                    _this.syncAndClean(networkStatus).then(function () {
                                        resolve();
                                    });
                                });
                            });
                        });
                    })];
            });
        });
    };
    DbService.prototype.deleteDb = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var request;
            return tslib_1.__generator(this, function (_a) {
                this.toastService.pushMessage('Database reset');
                this.toastService.presentToast();
                localStorage.clear();
                request = indexedDB.deleteDatabase(this.appSettings.appName);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        request.onsuccess = function () { console.info('[DB]: Delete db Ok'); resolve(request.result); };
                        request.onerror = function () { console.error('[DB]: Delete db Error'); reject(request.error); };
                    })];
            });
        });
    };
    DbService.prototype.createDb = function () {
        var _this = this;
        if (this.db) {
            this.db.close();
        }
        return new Promise(function (resolve) {
            var openRequest = indexedDB.open(_this.appSettings.appName);
            openRequest.onupgradeneeded = function (event) {
                var target = event.target, db = target.result, storeObjects = [];
                _this.tables.map(function (table) {
                    storeObjects['store' + table] = db.createObjectStore(table, { keyPath: 'id', autoIncrement: true });
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
            openRequest.onsuccess = function (event) {
                _this.db = event.target.result;
                _this.db.onerror = function (event) { console.error('[DB]: error createDb: ' + event); };
                console.info('[DB]: Db Ready');
                resolve();
            };
        });
    };
    DbService.prototype.initDb = function (resetDb) {
        if (resetDb === void 0) { resetDb = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        if (resetDb) {
                            console.info('[DB]: Delete db');
                            _this.deleteDb().then(function () { resolve(); });
                        }
                        else {
                            console.info('[DB]: Delete db not required');
                            resolve();
                        }
                    })];
            });
        });
    };
    DbService.prototype.initService = function (forceLoading) {
        if (forceLoading === void 0) { forceLoading = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var networkStatus, date, now, lastUpdate, promises, promise, lastGlobalUpdate, hoursWithoutUpdates, loading;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        networkStatus = this.api.networkService.status._value, date = new Date(), now = Date.now(), lastUpdate = [], promises = [];
                        promise = this.createDb();
                        lastGlobalUpdate = (localStorage.getItem(this.appSettings.appName + '_lastglobalupdate') || date.getDate() - 1);
                        hoursWithoutUpdates = (Number(now) - Number(lastGlobalUpdate)) / (1000 * 60 * 60);
                        if (!networkStatus || (hoursWithoutUpdates < 1 && forceLoading == false)) {
                            console.info('[DB]: Cached data');
                            return [2 /*return*/, promise];
                        }
                        console.info('[DB]: Force data sync');
                        localStorage.setItem(this.appSettings.appName + '_lastglobalupdate', String(now));
                        return [4 /*yield*/, this.loadingController.create({ message: 'Loading' })];
                    case 1:
                        loading = _a.sent();
                        loading.present();
                        return [2 /*return*/, promise.then(function () {
                                return Promise.all(_this.tables.map(function (table) {
                                    lastUpdate[table] = localStorage.getItem(_this.appSettings.appName + '_' + table);
                                    return _this.loadData(table, lastUpdate[table]);
                                }));
                            }).then(function (results) {
                                _this.syncData(results);
                                loading.dismiss();
                                return;
                            })];
                }
            });
        });
    };
    DbService.prototype.loadData = function (table, lastUpdate) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var params = { lastUpdate: lastUpdate };
                        _this.api.get(table, params)
                            .then(function (res) {
                            var _a;
                            resolve((_a = {}, _a[table] = res, _a));
                        });
                    })];
            });
        });
    };
    DbService.prototype.syncData = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        data.map(function (data) {
                            var table = Object.keys(data)[0];
                            var res = data[table];
                            //console.info("[DB]: Db Sync records ready ",data, table, res)
                            var tx = _this.db.transaction(table, 'readwrite');
                            var store = tx.objectStore(table);
                            var lastUpdate;
                            if (res.items.length) {
                                // var store = transaction.objectStore(...);
                                // return Promise.all(records.map( record => { return store.add(record); }))
                                //    .then( function () { return transaction.complete; });
                                var promises = res.items.map(function (row) {
                                    if (row.id) {
                                        var promise = void 0;
                                        if (row.deleted) {
                                            promise = store.delete(row.id);
                                        }
                                        else {
                                            promise = store.put(row);
                                        }
                                        promise.onsuccess = function (e) {
                                            //console.info('[DB]: Success syncing db table: "'+table+'", item:',e);
                                        };
                                        promise.onerror = function (e) {
                                            //console.error('[DB]: Error syncing db table: "'+table+'", item:',e);
                                        };
                                    }
                                    lastUpdate = ((row.lastUpdate > lastUpdate) || !lastUpdate ? row.lastUpdate : lastUpdate);
                                    tx.oncomplete = function (e) {
                                        if (lastUpdate) {
                                            localStorage.setItem(_this.appSettings.appName + '_' + table, lastUpdate);
                                        }
                                    };
                                });
                            }
                            else {
                                resolve();
                            }
                        });
                    })];
            });
        });
    };
    DbService.prototype.getItem = function (objectStore, id, column) {
        if (column === void 0) { column = 'id'; }
        var tx = this.db.transaction(objectStore, 'readonly');
        var store = tx.objectStore(objectStore);
        var dataIndex = store.index(column);
        var promise = new Promise(function (resolve) {
            if (id) {
                dataIndex.get(id).onsuccess = function (e) { return resolve(e.target.result); };
            }
        });
        return promise;
    };
    DbService.prototype.getItems = function (objectStore, column) {
        if (column === void 0) { column = 'enabled, deleted'; }
        var tx = this.db.transaction(objectStore, 'readonly');
        var store = tx.objectStore(objectStore);
        var dataIndex = store.index(column);
        var promise = new Promise(function (resolve) {
            dataIndex.getAll([1, 0]).onsuccess = function (e) { return resolve(e.target.result); };
        });
        return promise;
    };
    DbService.prototype.getConnectedItems = function (objectStore, column, id_rif) {
        var tx = this.db.transaction(objectStore, 'readonly');
        var store = tx.objectStore(objectStore);
        var dataIndex = store.index(column);
        var promise = new Promise(function (resolve) {
            dataIndex.getAll([1, 0, id_rif]).onsuccess = function (e) {
                resolve(e.target.result);
            };
        });
        return promise;
    };
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
    DbService.prototype.putItems = function (objectStore, items) {
        var _this = this;
        return new Promise(function (resolve) {
            items.map(function (item) {
                if (!item.id) {
                    delete item.id;
                }
                Object.keys(item).forEach(function (key) {
                    if (!isNaN(item[key])) {
                        item[key] = Number(item[key]);
                    }
                });
            });
            var lastUpdate = localStorage.getItem(_this.appSettings.appName + '_' + objectStore);
            var params = { lastUpdate: lastUpdate };
            _this.api.post(objectStore, items, params)
                .then(function (response) {
                var tx = _this.db.transaction(objectStore, 'readwrite');
                var store = tx.objectStore(objectStore);
                response.items.map(function (item) {
                    var promise = store.put(item);
                    promise.onsuccess = function (e) {
                        resolve();
                    };
                    promise.onerror = function (e) {
                        console.error('[DB]: Error adding: ' + e);
                    };
                });
            });
        });
    };
    DbService.prototype.deleteItem = function (objectStore, item) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.api.delete(objectStore, item)
                .then(function (item) {
                var tx = _this.db.transaction(objectStore, 'readwrite');
                var store = tx.objectStore(objectStore);
                if (item.synced != 0) {
                    var objectStoreRequest = store.delete(item.id);
                    objectStoreRequest.onsuccess = function (event) {
                        console.info('[DB]: item deleted. Table: "' + objectStore + '" id:' + item.id);
                        resolve();
                    };
                }
                else {
                    console.info('[DB]: item still not synced, don\'t remove from db but set to deleted:1. Table: "' + objectStore + '" id:' + item.id);
                    item.deleted = 1;
                    var tx_1 = _this.db.transaction(objectStore, 'readwrite');
                    var store_1 = tx_1.objectStore(objectStore);
                    var promise = store_1.put(item);
                    promise.onsuccess = function (e) {
                        resolve();
                    };
                    promise.onerror = function (e) {
                        console.error('[DB]: Error adding: ' + e);
                    };
                }
            });
        });
    };
    ////////////////////////////////////////////////
    //                                            //
    //    Db Sync Offline to Remote and Clean     //
    //                                            //
    ////////////////////////////////////////////////
    DbService.prototype.syncAndClean = function (networkStatus) {
        var _this = this;
        var promise = new Promise(function (resolve) {
            if (networkStatus) {
                _this.toastService.pushMessage('Database sync and cleaning');
                _this.syncStoredItems().then(function () {
                    _this.removeDeletedItem().then(function () {
                        console.info('[DB]: Db cleaned');
                        resolve();
                    });
                });
            }
            else {
                resolve();
            }
        });
        return promise;
    };
    DbService.prototype.syncStoredItems = function () {
        var _this = this;
        var promise = new Promise(function (resolve) {
            console.info('[DB]: Sync stored items with remote');
            _this.tables.map(function (table) {
                _this.getItemsToBeSynced(table).then(function (items) {
                    if (items.length) {
                        console.info('[DB]: Items to sync. Table:"' + table + '" items:', items);
                        items.map(function (item) {
                            var saveItem = Array();
                            saveItem.push(item);
                            _this.putItems(table, saveItem).then(function () { resolve(); });
                        });
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
        return promise;
    };
    DbService.prototype.getItemsToBeSynced = function (objectStore) {
        var tx = this.db.transaction(objectStore, 'readonly');
        var store = tx.objectStore(objectStore);
        var dataIndex = store.index('synced');
        var promise = new Promise(function (resolve) {
            dataIndex.getAll(0).onsuccess = function (e) {
                resolve(e.target.result);
            };
        });
        return promise;
    };
    DbService.prototype.removeDeletedItem = function () {
        var _this = this;
        var promise = new Promise(function (resolve) {
            console.info('[DB]: Sync deleted items with remote then remove');
            _this.tables.map(function (table) {
                _this.getItemsToBeRemoved(table).then(function (items) {
                    if (items.length) {
                        console.info('[DB]: items to remove. Table:"' + table + '" items:', items);
                        items.map(function (item) {
                            _this.deleteItem(table, item).then(function () { resolve(); });
                        });
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
        return promise;
    };
    DbService.prototype.getItemsToBeRemoved = function (objectStore) {
        var tx = this.db.transaction(objectStore, 'readonly');
        var store = tx.objectStore(objectStore);
        var dataIndex = store.index('deleted');
        var promise = new Promise(function (resolve) {
            dataIndex.getAll(1).onsuccess = function (e) {
                resolve(e.target.result);
            };
        });
        return promise;
    };
    DbService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [LoadingController,
            ToastService,
            SettingsService,
            ApiService])
    ], DbService);
    return DbService;
}());
export { DbService };
//# sourceMappingURL=db.service.js.map