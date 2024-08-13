import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { SettingsService } from '../settings/settings.service';
import { ToastService } from '../toast/toast.service';
import { PlantInterface } from '../../interfaces/plant';
import { StrainInterface } from '../../interfaces/strain';
import { CompanyInterface } from '../../interfaces/company';
import { DoseInterface } from '../../interfaces/dose';
import { CalendarInterface } from '../../interfaces/calendar';
import { LoadingController } from '@ionic/angular';
import { ProbeInterface, ProbeLogRowInterface } from '../../interfaces/probe';
import { WorkerInterface, WorkerLogRowInterface } from '../../interfaces/worker';
import { WorkersTypes } from '../../services/settings/enum';
import { ProbesTypes } from '../../services/settings/enum';
import { ScheduleTypes } from '../../services/settings/enum';
import { SettingsInterface } from '../../interfaces/settings';
import { ProbeTypeInterface } from '../../interfaces/probeType';
import { WorkerTypeInterface } from '../../interfaces/workerType';



@Injectable({
  providedIn: 'root',
})
export class DbService {
  private db: IDBDatabase | undefined;
  private tables: string[] = [];
  private debug = false;
  constructor(
    public loadingController: LoadingController,
    private toastService: ToastService,
    private appSettings: SettingsService,
    public api: ApiService,
  ) {
    this.tables = this.appSettings.datatables;
    this.api.init();
  }

  async load(): Promise<void> {
    try {
      const resetDb = false; // DB also forged on resetDb
      const forceLoading = true;
  
      // Initialize the database and services
      await this.initDb(resetDb);
      await this.initService(resetDb || forceLoading);
  
      // Wait for network status subscription and handle network-based actions
      await new Promise<void>((resolve, reject) => {
        const subscription = this.api.networkService.status.subscribe(async (networkStatus) => {
          if (this.debug) {
            console.info('[DB]: Network status:', networkStatus ? 'Online' : 'Offline');
          }
  
          try {
            await this.syncAndClean(networkStatus ? 'Online' : 'Offline');
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            subscription.unsubscribe(); // Ensure to unsubscribe when done
          }
        });
      });
    } catch (error) {
      console.error('[DB]: Error loading data:', error);
      throw error; // Rethrow to propagate the error up the call stack
    }
  }
  

  async deleteDb(): Promise<void> {
    this.toastService.pushMessage('Database reset');
    this.toastService.presentToast();
    localStorage.clear();
    const request = indexedDB.deleteDatabase(this.appSettings.appName);
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        if (globalThis.debug) {
          console.info('[DB]: Delete db Ok');
        }
        resolve(request.result);
      };
      request.onerror = function () {
        console.error('[DB]: Delete db Error');
        reject(request.error);
      };
    });
  }

  private createDb(): Promise<void> {
    if (this.db) {
      (this.db as IDBDatabase).close();
    }
    return new Promise((resolve) => {
      const openRequest = indexedDB.open(this.appSettings.appName);
      openRequest.onupgradeneeded = (event) => {
        const target = event.target;
        const db = target["result"];
        const storeObjects: [] = [];
        if (this.debug) {
          console.log('[DB]: ', this.tables);
        }
        this.tables.map((table) => {
          console.log('[DB]: createObjectStore', table);

          storeObjects[('store' + table)] = db.createObjectStore(table, {
            keyPath: 'id',
            autoIncrement: true,
          });
          storeObjects[('store' + table)].createIndex('id', ['id']);
          storeObjects[('store' + table)].createIndex(
            'enabled, deleted',
            ['enabled', 'deleted'],
          );
          storeObjects[('store' + table)].createIndex(
            'synced',
            ['synced'],
            { unique: false },
          );
          storeObjects[('store' + table)].createIndex(
            'deleted',
            ['deleted'],
            { unique: false },
          );
          if (table === 'settings') {
            storeObjects[('store' + table)].createIndex('device', [
              'device',
            ]);
          }
          if (this.debug) {
            console.info('[DB]: Table created:' + table);
          }
        });
        if (this.debug) {
          console.info('[DB]: Db forged');
        }
      };
      openRequest.onsuccess = (event: unknown) => {
        this.db = event["target"].result;
        (this.db as IDBDatabase).onerror = (error) => {
          console.error('[DB]: error createDb: ' + error);
        };
        if (this.debug) {
          console.info('[DB]: Db Ready');
        }
        resolve();
      };
    });
  }

  async initDb(resetDb = false): Promise<void> {
    if (resetDb) {
      if (globalThis.debug) {
        console.info('[DB]: Delete db');
      }
      await this.deleteDb();
    } else {
      if (globalThis.debug) {
        console.info('[DB]: Delete db not required');
      }
    }
  }
  

  async initService(forceLoading = false): Promise<void> {
    const networkStatus = this.api.networkService.status.getValue();
    const date = new Date();
    const now = Date.now();

    const promise = this.createDb();

    const lastGlobalUpdate =
      localStorage.getItem(this.appSettings.appName + '_lastglobalupdate') ||
      date.getDate() - 1;
    const hoursWithoutUpdates =
      (Number(now) - Number(lastGlobalUpdate)) / (1000 * 60 * 60);

    if (!networkStatus || (hoursWithoutUpdates < 1 && forceLoading === false)) {
      if (globalThis.debug) {
        console.info('[DB]: Cached data');
      }
      return promise;
    }

    if (globalThis.debug) {
      console.info('[DB]: Force data sync');
    }
    localStorage.setItem(
      this.appSettings.appName + '_lastglobalupdate',
      String(now),
    );
    const loading = await this.loadingController.create({ message: 'Loading' });
    loading.present();

    // return promise
    //   .then(() =>
    //     Promise.all(
    //       this.tables.map((table) => {
    //         lastUpdate[table] = localStorage.getItem(
    //           this.appSettings.appName + '_' + table,
    //         );
    //           return this.loadData(table, lastUpdate[table]);
    //       }),
    //     ),
    //   )
    //   .then((results) => {
    //     this.syncData(results)
    //     loading.dismiss();
    //     return;
    //   });
    try {
      await promise;

      const results = await Promise.all(
        this.tables.map(async (table) => {
          const lastUpdate = localStorage.getItem(
            `${this.appSettings.appName}_${table}`,
          );
          return await this.loadData(table, lastUpdate as string);
        }),
      );

      this.syncData(results);
      loading.dismiss();
    } catch (error) {
      console.error('An error occurred:', error);
      // Handle error appropriately, for example, by showing an error message
    }
  }

  async loadData(table: string, lastUpdate: string): Promise<Record<string, unknown>> {
    const params = { lastUpdate };
    const res = await this.api.get(table, params);
    return { [table]: res };
  }

  async syncData(dataValues: unknown[]): Promise<void> {
    for (const data of dataValues) {
      const table = Object.keys(data)[0];
      const res = data[table];
  
      if (globalThis.debug) {
        console.info('[DB]: Db Sync records ready ', table, res, res.length);
      }
  
      try {
        const tx = (this.db as IDBDatabase).transaction(table, 'readwrite');
        const store = tx.objectStore(table);
  
        let lastUpdate: string | undefined;
  
        for (const row of res.items) {
          if (row.id) {
            try {
              if (row.deleted) {
                await store.delete(row.id);
              } else {
                await store.put(row);
              }
  
              if (globalThis.debug) {
                console.info(`[DB]: Success syncing db table: "${table}", item:`, row.id);
              }
            } catch (e) {
              console.error(`[DB]: Error syncing db table: "${table}", item:`, row.id, e);
            }
          }
  
          lastUpdate = !lastUpdate || row.lastUpdate !== lastUpdate ? row.lastUpdate : lastUpdate;
        }
  
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => {
            if (lastUpdate) {
              localStorage.setItem(
                `${this.appSettings.appName}_${table}`,
                lastUpdate,
              );
            }
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        });
  
      } catch (e) {
        console.log(`[DB]: Error syncing table "${table}":`, e);
      }
    }
  }
  

  hi(): Promise<void> {
    return new Promise((resolve) => {
      console.log('DbService initialized');
      resolve();
    });
  }

  getItem(objectStore, id, column = 'id'): Promise<PlantInterface | DoseInterface | StrainInterface | CompanyInterface > {
    const tx = this.db.transaction(objectStore, 'readonly');
    const store = tx.objectStore(objectStore);
    const dataIndex: IDBIndex = store.index(column);
    const promise = new Promise<PlantInterface | StrainInterface | CompanyInterface | DoseInterface | CalendarInterface>(
      (resolve) => {
        if (id) {
          const queryExecute:IDBRequest<unknown> = dataIndex.get(+id);
          queryExecute.onsuccess = (e) => {
            if (e["target"]["result"] === undefined) {
              const queryExecute = dataIndex.get([+id]);
              queryExecute.onsuccess = (e) => {
                resolve(e["target"]["result"]);
              };
              queryExecute.onerror = (e) => {
                console.log(e);
              };
            }

            resolve(e["target"]["result"]);
          };
          queryExecute.onerror = (e) => {
            console.log(e);
          };
        } else {
          resolve(null);
        }
      },
    );
    return promise;
  }

  getItems(
    objectStore: string,
    column = 'enabled, deleted',
    query = [1, 0],
  ): Promise<(PlantInterface | DoseInterface | StrainInterface | CompanyInterface | WorkerInterface | ProbeInterface | WorkersTypes | ProbesTypes | ScheduleTypes| ProbeLogRowInterface | WorkerLogRowInterface | SettingsInterface | ProbeTypeInterface | WorkerTypeInterface )[]> {
    const tx = (this.db as IDBDatabase).transaction(objectStore, 'readonly');
    const store = tx.objectStore(objectStore);
    const dataIndex = store.index(column);
    const promise = new Promise<
    (PlantInterface | DoseInterface | StrainInterface | CompanyInterface | WorkerInterface | ProbeInterface | WorkersTypes | ProbesTypes | ScheduleTypes| ProbeLogRowInterface | WorkerLogRowInterface | SettingsInterface | ProbeTypeInterface | WorkerTypeInterface)[]
    >((resolve) => {
      if (query.length > 0) {
        const queryExecute = dataIndex.getAll(query);
        queryExecute.onsuccess = (e) => {
          resolve(e["target"]["result"]);
        };
        queryExecute.onerror = (e) => {
          console.log(e);
        };
      } else {
        const queryExecute = dataIndex.getAll();
        queryExecute.onsuccess = (e) => {
          resolve(e["target"]["result"]);
        };
        queryExecute.onerror = (e) => {
          console.log(e);
        };
      }
    });
    return promise;
  }

  async putItem(
    objectStore: string,
    item: Partial<PlantInterface | DoseInterface | StrainInterface | CompanyInterface | WorkerInterface | ProbeInterface | WorkersTypes | ProbesTypes | ScheduleTypes| ProbeLogRowInterface | WorkerLogRowInterface | SettingsInterface | ProbeTypeInterface | WorkerTypeInterface>,
  ): Promise<void> {
    try {
      if (!item.id) {
        delete item.id;
      }
  
      const lastUpdate = localStorage.getItem(`${this.appSettings.appName}_${objectStore}`);
      const params = { lastUpdate };
      const response = await this.api.post(objectStore, item, params);
  
      if (response && response["items"] && response["items"].length > 0) {
        const tx = (this.db as IDBDatabase).transaction(objectStore, 'readwrite');
        const store = tx.objectStore(objectStore);
        const request = store.put(response["items"][0]);
  
        return new Promise<void>((resolve, reject) => {
          request.onsuccess = () => resolve();
          request.onerror = (e) => {
            console.error(`[DB]: Error adding item to ${objectStore}:`, e);
            reject(e);
          };
        });
      } else {
        throw new Error(`[API]: No valid items returned from API for ${objectStore}`);
      }
    } catch (error) {
      console.error(`[DB]: Failed to put item in ${objectStore}:`, error);
      return Promise.reject(error);
    }
  }
  

  async deleteItem(objectStore: string, itemToDelete): Promise<void> {
    try {
      const item = await this.api.delete(objectStore, itemToDelete);
      const tx = (this.db as IDBDatabase).transaction(objectStore, 'readwrite');
      const store = tx.objectStore(objectStore);
  
      if (item["synced"] !== 0) {
        await this.performStoreOperation(store, 'delete', item["id"], objectStore);
      } else {
        if (globalThis.debug) {
          console.info(
            `[DB]: Item not synced, marking as deleted: 1. Table: "${objectStore}", ID: ${item["id"]}`
          );
        }
  
        item["deleted"] = 1;
        await this.performStoreOperation(store, 'put', item, objectStore);
      }
    } catch (e) {
      console.error(`[DB]: Error processing item: ${e}`);
      throw e; // Rethrow error to allow higher-level handling if needed.
    }
  }
  
  private performStoreOperation(
    store: IDBObjectStore,
    operation: 'delete' | 'put',
    data: IDBValidKey,
    objectStore: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = operation === 'delete' ? store.delete(data) : store.put(data);
  
      request.onsuccess = () => {
        if (globalThis.debug) {
          const action = operation === 'delete' ? 'deleted' : 'updated';
          console.info(`[DB]: Item ${action}. Table: "${objectStore}", Data: ${data}`);
        }
        resolve();
      };
  
      request.onerror = (e) => {
        console.error(`[DB]: Error during ${operation}: ${e}`);
        reject(e);
      };
    });
  }
  
  

  ////////////////////////////////////////////////
  //                                            //
  //    Db Sync Offline to Remote and Clean     //
  //                                            //
  ////////////////////////////////////////////////

  async syncAndClean(networkStatus: string): Promise<void> {
    if (networkStatus) {
      this.toastService.pushMessage('Database sync and cleaning');
      await this.syncStoredItems();
      await this.removeDeletedItem();
      
      if (globalThis.debug) {
        console.info('[DB]: Db cleaned');
      }
    }
  
    // The method automatically resolves the promise when it completes
  }
  

  syncStoredItems(): Promise<unknown> {
    const promise = new Promise<void>((resolve) => {
      if (globalThis.debug) {
        console.info('[DB]: Sync stored items with remote');
      }
      this.tables.map(async (table) => {
        const items = await this.getItemsToBeSynced(table);
        if (items["length"]) {
          if (globalThis.debug) {
            console.info(
              '[DB]: Items to sync. Table:"' + table + '" items:',
              items,
            );
          }
          items.map(async (item) => {
            await this.putItem(table, item);
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
    return promise;
  }

  getItemsToBeSynced(objectStore): Promise<(boolean)> {
    try {
      const tx = (this.db as IDBDatabase).transaction(objectStore, 'readonly');
      const store = tx.objectStore(objectStore);
      const dataIndex: IDBIndex = store.index('synced');

      const promise = new Promise<unknown>((resolve) => {
        const request = dataIndex.getAll(0);
        request.onsuccess = (e) => {
          resolve(e.target["result"]);
        };
        request.onerror = (e) => {
          console.error(e);
        };
      });
      return promise;
    } catch (e) {
      console.log(objectStore, e);
      return new Promise((resolve) => resolve(false));
    }
  }

  removeDeletedItem(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      if (this.debug) {
        console.info('[DB]: Sync deleted items with remote then remove');
      }
      this.tables.map(async (table) => {
        const items = await this.getItemsToBeRemoved(table);
        if (items["length"]) {
          if (this.debug) {
            console.info(
              '[DB]: items to remove. Table:"' + table + '" items:',
              items,
            );
          }
          items.map(async (item) => {
            await this.deleteItem(table, item);
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
    return promise;
  }

  getItemsToBeRemoved(objectStore): Promise<unknown> {
    const tx = (this.db as IDBDatabase).transaction(objectStore, 'readonly');
    const store = tx.objectStore(objectStore);
    const dataIndex = store.index('deleted');
    const promise = new Promise<unknown>((resolve) => {
      dataIndex.getAll(1).onsuccess = (e) => {
        resolve(e.target["result"]);
      };
    });
    return promise;
  }
}
