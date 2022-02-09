import { ApiService } from '../api/api.service';
import { SettingsService } from '../settings/settings.service';

import { Plant } from '../../interfaces/plant';
import { Strain } from '../../interfaces/strain';
import { Company } from '../../interfaces/company';
import { Dose } from '../../interfaces/dose';
import { Calendar } from '../../interfaces/calendar';

export class DbService {

	private db: IDBDatabase;
	private tables = [];
  private debug = false;

  	constructor(
  		private appSettings: SettingsService,
        public api: ApiService,
  	) {
        this.tables = this.appSettings.getTables();
        this.api.init();
    }

    async load(): Promise<any> {
      const self = this;
      return new Promise<void>(resolve=> {
          const resetDb = false; const forceLoading = true;
          this.initDb(resetDb).then(()=>{
              this.initService((resetDb?resetDb:forceLoading)).then(()=>{
                  // this.api.networkService.status.subscribe((networkStatus) => {
                  //     if(self.debug) { console.info('[DB]: Network status: ' + (networkStatus ? 'Online' : 'Offline'));}
                      const networkStatus = 'Online';
                      this.syncAndClean(networkStatus).then(()=>{
                          resolve();
                      });
                  // });
              });
          });
      });
    }

    async deleteDb(): Promise<any> {
      const self = this;
      localStorage.clear();
      const request = indexedDB.deleteDatabase(this.appSettings.getAppName());
      return new Promise(function(resolve, reject) {
        request.onsuccess = function() { if(self.debug) { console.info('[DB]: Delete db Ok');} resolve(request.result); };
        request.onerror = function() { console.error('[DB]: Delete db Error'); reject(request.error); };
      });
    }

    private createDb(): Promise<void> {
        if (this.db) { this.db.close(); }
        return new Promise(resolve => {
            const openRequest = indexedDB.open(this.appSettings.getAppName());
            openRequest.onupgradeneeded = event => {
                const target: any = event.target; const db = target.result; const storeObjects = [];
                this.tables.map(table => {
                    storeObjects['store' + table] = db.createObjectStore(table, {keyPath: 'id', autoIncrement:true});
                    storeObjects['store' + table].createIndex('id', ['id']);
                    storeObjects['store' + table].createIndex('enabled, deleted', ['enabled','deleted']);
                    storeObjects['store' + table].createIndex('synced', ['synced'], { unique: false });
                    storeObjects['store' + table].createIndex('deleted', ['deleted'], { unique: false });
                });
                if(this.debug) { console.info('[DB]: Db forged');}
            };
            openRequest.onsuccess = (event) => {
                this.db = (<any>event.target).result;
                this.db.onerror = error => { console.error('[DB]: error createDb: '+error); };
                if(this.debug) { console.info('[DB]: Db Ready');}
                resolve();
            };
        });
    }

    async initDb(resetDb=false): Promise<any> {
      const self = this;
      return new Promise<void>(resolve => {
        if(resetDb){
          if(self.debug) { console.info('[DB]: Delete db');}
          this.deleteDb().then(()=>{ resolve(); });
        }else{
          if(self.debug) { console.info('[DB]: Delete db not required');}
          resolve();
        }
      });
    }

    async initService(forceLoading=false): Promise<void> {
      const self = this;
      const networkStatus = this.api.networkService.status._value;
      const date = new Date();
      const now = Date.now();
      const lastUpdate = []; const promises = [];

      const promise = this.createDb();

      const lastGlobalUpdate = ( localStorage.getItem(this.appSettings.getAppName()+'_lastglobalupdate') || date.getDate()-1 );
      const hoursWithoutUpdates = (Number(now) - Number(lastGlobalUpdate)) / (1000*60*60);

      if (!networkStatus || (hoursWithoutUpdates<1 && forceLoading===false)) {
          if(self.debug) { console.info('[DB]: Cached data');}
          return promise;
      }

      if(self.debug) { console.info('[DB]: Force data sync');}
      localStorage.setItem(this.appSettings.getAppName()+'_lastglobalupdate', String(now));

      return promise.then(() => Promise.all(this.tables.map( (table) => {
          lastUpdate[table] = localStorage.getItem(this.appSettings.getAppName()+'_'+table);
          return this.loadData(table, lastUpdate[table]);
        }))).then((results) => {
          this.syncData(results);
        return;
      });
    }

    async loadData(table, lastUpdate): Promise<any> {
      return new Promise((resolve,reject) => {
        const params = { lastUpdate };
        this.api.get(table, params)
        .then((res) => {
          resolve({[table] : res});
        });
      });
    }

    async syncData(dataValues){
      const self = this;
      return new Promise<void>((resolve) => {
        dataValues.map((data)=>{
          const table = Object.keys(data)[0];
          const res = data[table];
          if(self.debug) { console.info('[DB]: Db Sync records ready ',table, res, res.length);}
          const tx = this.db.transaction(table, 'readwrite');
          const store = tx.objectStore(table);
          let lastUpdate;
          if(res.items.length){
            const promises = res.items.map(row => {
              if (row.id) {
                let promise;
                if(row.deleted){
                  promise = store.delete(row.id);
                }else{
                  promise = store.put(row);
                }
                promise.onsuccess = function(e){
                  if(self.debug) { console.info('[DB]: Success syncing db table: "'+table+'", item:',e);}
                };
                promise.onerror = function(e){
                  console.error('[DB]: Error syncing db table: "'+table+'", item:',e);
                };
              }
              lastUpdate = ( (row.lastUpdate > lastUpdate)||!lastUpdate ? row.lastUpdate : lastUpdate);
              tx.oncomplete = e => {
                if(lastUpdate){
                    localStorage.setItem(this.appSettings.getAppName()+'_'+table, lastUpdate);
                }
              };
            });
          }else{ resolve(); }
        });
      });
    }

    getItem(objectStore, id, column='id'): Promise<any> {
        const tx = this.db.transaction(objectStore, 'readonly');
        const store = tx.objectStore(objectStore);
        const dataIndex: any = store.index(column);
        const promise = new Promise<Plant | Strain | Company | Dose | Calendar>(resolve => {
            if(id){
                dataIndex.get(id).onsuccess = e => resolve(e.target.result);
            } else {
              resolve(null);
            }
        });
        return promise;
    }

    getItems(objectStore, column='enabled, deleted'): Promise<any> {
        const tx = this.db.transaction(objectStore, 'readonly');
        const store = tx.objectStore(objectStore);
        const dataIndex: any = store.index(column);
        const promise = new Promise<Plant | Strain | Company | Dose | Calendar>(resolve => {
            dataIndex.getAll([1,0]).onsuccess = e => resolve(e.target.result);
        });
        return promise;
    }

    putItem(objectStore, item: Plant | Strain | Company | Dose | Calendar): Promise<void>{
      return new Promise(resolve => {
        if(!item.id){ delete item.id; }
        const lastUpdate = localStorage.getItem(this.appSettings.getAppName()+'_'+objectStore);
        const params = { lastUpdate };
        this.api.post(objectStore, item, params)
          .then((response: any) => {
            const tx = this.db.transaction(objectStore, 'readwrite');
            const store = tx.objectStore(objectStore);
            const promise = store.put(response.items[0]);
            promise.onsuccess = function(e){
              resolve();
            };
            promise.onerror = function(e){
              console.error('[DB]: Error adding: '+e);
            };
          });
      });
    }

    deleteItem(objectStore, itemToDelete: any): Promise<void>{
      const self = this;
      return new Promise(resolve => {
        this.api.delete(objectStore, itemToDelete)
          .then((item:any) => {
            const tx = this.db.transaction(objectStore, 'readwrite');
            const store = tx.objectStore(objectStore);
            if(item.synced!==0){
              const objectStoreRequest = store.delete(item.id);
              objectStoreRequest.onsuccess = function(event) {
                if(self.debug) { console.info('[DB]: item deleted. Table: "'+objectStore+'" id:'+item.id);}
                resolve();
              };
            }else{
              if(self.debug) {
                console.info('[DB]: item still not synced, don\'t remove from db but set to deleted:1. Table: "'
                +objectStore+'" id:'+item.id);
              }
              item.deleted = 1;
              const tx1 = this.db.transaction(objectStore, 'readwrite');
              const store1 = tx1.objectStore(objectStore);
              const promise = store1.put(item);
              promise.onsuccess = function(e){
                  resolve();
              };
              promise.onerror = function(e){
                  console.error('[DB]: Error adding: '+e);
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

  syncAndClean(networkStatus): Promise<any>{
    const self = this;
    const promise = new Promise<void>(resolve => {
      if(networkStatus){
        this.syncStoredItems().then(()=>{
          this.removeDeletedItem().then(()=>{
            if(self.debug) { console.info('[DB]: Db cleaned');}
            resolve();
          });
        });
      }else{
        resolve();
      }
    });
    return promise;
  }

  syncStoredItems(): Promise<any>{
    const self = this;
    const promise = new Promise<void>(resolve => {
      if(self.debug) { console.info('[DB]: Sync stored items with remote');}
      this.tables.map((table) => {
        this.getItemsToBeSynced(table).then((items)=>{
          if(items.length){
            if(self.debug) { console.info('[DB]: Items to sync. Table:"'+table+'" items:',items);}
            items.map((item)=>{
                this.putItem(table, item).then(()=>{ resolve(); });
            });
          }else{ resolve(); }
        });
      });
    });
    return promise;
  }

  getItemsToBeSynced(objectStore): Promise<any>{
    const tx = this.db.transaction(objectStore, 'readonly');
    const store = tx.objectStore(objectStore);
    const dataIndex: any = store.index('synced');
    const promise = new Promise<any>(resolve => {
      const request = dataIndex.getAll(0);
      request.onsuccess = (e) => {
        resolve(e.target.result);
      };
      request.onerror = (e) => {
        console.error(e);
      };
    });
    return promise;
  }

  removeDeletedItem(): Promise<void>{
    const promise = new Promise<void>(resolve => {
      if(this.debug) { console.info('[DB]: Sync deleted items with remote then remove');}
      this.tables.map((table) => {
        this.getItemsToBeRemoved(table).then((items)=>{
          if(items.length){
            if(this.debug) { console.info('[DB]: items to remove. Table:"'+table+'" items:',items);}
            items.map((item)=>{
              this.deleteItem(table, item).then(()=>{ resolve(); });
            });
          }else{ resolve(); }
        });
      });
    });
    return promise;
  }

  getItemsToBeRemoved(objectStore): Promise<any>{
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

export default DbService;
