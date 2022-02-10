import { ApiService } from '../api/api.service';
import { SettingsService } from '../settings/settings.service';

import { Plant } from '../../interfaces/plant';
import { Strain } from '../../interfaces/strain';
import { Company } from '../../interfaces/company';
import { Dose } from '../../interfaces/dose';
import { Calendar } from '../../interfaces/calendar';

import { LocalStorage } from 'node-localstorage';
import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

export class DbService {

	private db;
	private tables = [];
  private localStorage = new LocalStorage('./data/scratch');
  private debug = true;

  	constructor(
  		private appSettings: SettingsService,
        public api: ApiService,
  	) {
        this.tables = this.appSettings.getTables();
        this.api.init();
    }

    async load(): Promise<any> {
      const self = this;
      return new Promise<void>((resolve, reject)=> {
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
              })
              .catch(() => {
                console.error('Err1');
                reject();
            })
          });
      });
    }

    async deleteDb(): Promise<any> {
      const self = this;
      this.localStorage.clear();
      const pathToFile = './data/grover.sqlite';
      if (fs.existsSync(pathToFile)) {
        fs.unlinkSync(pathToFile)
      }
      if(this.debug) { console.info('[DB]: Db deleted');}
      return;
    }

    private createDb(): Promise<void> {
      console.log(`[DB] => createDb`)
        if (this.db) { 
          console.log(this.db);
          this.db.close(); 
        }
        return new Promise((resolve, reject) => {
            // const openRequest = this.db.open(this.appSettings.getAppName());
            // openRequest.onupgradeneeded = event => {
            //     const target: any = event.target; const db = target.result; const storeObjects = [];
            //     this.tables.map(table => {
            //         storeObjects['store' + table] = db.createObjectStore(table, {keyPath: 'id', autoIncrement:true});
            //         storeObjects['store' + table].createIndex('id', ['id']);
            //         storeObjects['store' + table].createIndex('enabled, deleted', ['enabled','deleted']);
            //         storeObjects['store' + table].createIndex('synced', ['synced'], { unique: false });
            //         storeObjects['store' + table].createIndex('deleted', ['deleted'], { unique: false });
            //     });
            //     if(this.debug) { console.info('[DB]: Db forged');}
            // };
            // this.db.onsuccess = (event) => {
            //     this.db = (<any>event.target).result;
            //     this.db.onerror = error => { console.error('[DB]: error createDb: '+error); };
            //     if(this.debug) { console.info('[DB]: Db Ready');}
            //     resolve();
            // };

            const __dirname = path.resolve();
            console.log(__dirname+'/data/grover.sqlite');
            this.db = new sqlite3.Database(__dirname+'/data/grover.sqlite', sqlite3.OPEN_READWRITE, err => { 
              if (err) {
                console.error('[DB]: error createDb: ' + err.message);
                reject();
              } else {
                // this.appSettingDelete dbs.getTables().map(table => {
                //   this.db.serialize( () => {
                //     this.db.run(
                //       `create table if not exists ${table} (
                //         id numeric primary key, 
                //         enabled boolean, 
                //         lastUpdate number, 
                //         deleted boolean)`
                //     );
                //   });
                // });
                if(this.debug) { console.info('[DB]: Db Ready');}
              }
              resolve();
            });
            
        });
    }

    async initDb(resetDb=false): Promise<any> {
      const self = this;
      return new Promise<void>(resolve => {
        if(resetDb===true){
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
      // const networkStatus = this.api.networkService.status._value;
      const networkStatus = true;
      const date = new Date();
      const now = Date.now();
      const lastUpdate = []; const promises = [];
      console.log(`[DB] => init service`)
      const promiseCreateDb = this.createDb();

      const lastGlobalUpdate = ( this.localStorage.getItem(this.appSettings.getAppName()+'_lastglobalupdate') || date.getDate()-1 );
      const hoursWithoutUpdates = (Number(now) - Number(lastGlobalUpdate)) / (1000*60*60);

      if (!networkStatus || (hoursWithoutUpdates<1 && forceLoading===false)) {
        if(self.debug) { console.info('[DB]: Cached data');}
        return promiseCreateDb;
      }

      if(self.debug) { console.info('[DB]: Force data sync');}
      this.localStorage.setItem(this.appSettings.getAppName()+'_lastglobalupdate', String(now));

      return promiseCreateDb
      .then(() => Promise.all(this.tables.map((table) => {
        lastUpdate[table] = this.localStorage.getItem(this.appSettings.getAppName()+'_'+table);
        return this.loadData(table, lastUpdate[table]);
      }))).then((results) => {
        if (self.debug) { console.info('[DB]: Db results ', results);}
        this.syncData(results);
        return;
      })
      .catch(() => {
        console.error('Err2');
      })
    }

    async loadData(table, lastUpdate): Promise<any> {
      return new Promise((resolve, reject) => {
        this.api.get(table, lastUpdate)
        .then((res) => {
          resolve({[table] : res});
        });
      });
    }

    async syncData(dataValues){
      const self = this;
      return new Promise<void>((resolve, reject) => {
        dataValues.map((data)=>{
          const table = Object.keys(data)[0];
          const res = data[table];
          if(self.debug) { console.info('[DB]: Db Sync records ready ',table, res);}
          // const tx = this.db.transaction(table, 'readwrite');
          // const store = tx.objectStore(table);
          // let lastUpdate;
          if(res.items.length){

            // sqlite if table not exist;
            const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (
            ${res.tableDefinition.map(el => {
              const definition = el;
              
              // console.log( definition)
              return `${definition.name} ${definition.type} ${definition.primary_key ? 'primary key' : ''}`;
            })})`;
            console.log("definition")
            console.log(createTableQuery);
            const create = this.db.run(createTableQuery, function(err) {
              if (err) {
                // return console.error(err.message);
                reject();
              } else { if(this.debug){console.log(`[DB] Table ${table} ok`); }}
              
              resolve();
              // const promises = res.items.map(row => {
              //   if (row.id) {
              //     let promise;
              //     if(row.deleted){
              //       promise = this.db.run(`DELETE FROM ${table} WHERE id=?`, row.id, function(err) {
              //         if (err) {
              //           return console.error(err.message);
              //         }
              //         if(this.debug){console.log(`Row(s) deleted ID ${row.id}`);}
              //       });
              //     }else{
              //       let length;
              //       const values = [];
              //       Object.keys(row).forEach(function(key, index) {
              //         length = index;
              //         values.push(row[key]);
              //       });
              //       const query = `insert into ${table} values (${'?,'.repeat(length-1)}?)`;
              //       console.log("insert");
              //       console.log(query);
              //       this.db.run(query);
              //     }
              //     resolve();
              //   }
              // });
            });
          }else{ resolve(); }
        });
      });
    }

    getItem(objectStore, id, column='id'): Promise<any> {
        // const tx = this.db.transaction(objectStore, 'readonly');
        // const store = tx.objectStore(objectStore);
        // const dataIndex: any = store.index(column);
        const promise = new Promise<Plant | Strain | Company | Dose | Calendar>(resolve => {
            if(id){
              //  dataIndex.get(id).onsuccess = e => resolve(e.target.result);
            } else {
              resolve(null);
            }
        });
        return promise;
    }

    getItems(objectStore, column='enabled, deleted'): Promise<any> {
        // const tx = this.db.transaction(objectStore, 'readonly');
        // const store = tx.objectStore(objectStore);
        // const dataIndex: any = store.index(column);
        const promise = new Promise<Plant | Strain | Company | Dose | Calendar>(resolve => {
          // dataIndex.getAll([1,0]).onsuccess = e => resolve(e.target.result);
        });
        return promise;
    }

    putItem(objectStore, item: Plant | Strain | Company | Dose | Calendar): Promise<void>{
      return new Promise(resolve => {
        if(!item.id){ delete item.id; }
        const lastUpdate = this.localStorage.getItem(this.appSettings.getAppName()+'_'+objectStore);
        const params = { lastUpdate };
        this.api.post(objectStore, item, params)
          .then((response: any) => {
            // const tx = this.db.transaction(objectStore, 'readwrite');
            // const store = tx.objectStore(objectStore);
            // const promise = store.put(response.items[0]);
            // promise.onsuccess = function(e){
            //   resolve();
            // };
            // promise.onerror = function(e){
            //   console.error('[DB]: Error adding: '+e);
            // };
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
    const promise = new Promise<void>((resolve, reject) => {
      if(self.debug) { console.info('[DB]: Sync stored items with remote');}
      this.tables.map((table) => {
        this.getItemsToBeSynced(table)
          .then((items)=>{
            if(items.length){
              if(self.debug) { console.info('[DB]: Items to sync. Table:"'+table+'" items:',items);}
              items.map((item)=>{
                  this.putItem(table, item).then(()=>{ resolve(); });
              });
            }else{ resolve(); }
          })
          .catch(() => {
            console.error('Err1');
            reject();
          });
      });
    })
    
    return promise;
  }

  getItemsToBeSynced(objectStore): Promise<any>{
    // const tx = this.db.transaction(objectStore, 'readonly');
    // const store = tx.objectStore(objectStore);
    // const dataIndex: any = store.index('synced');
    const promise = new Promise<any>(resolve => {
      // const request = dataIndex.getAll(0);
      // request.onsuccess = (e) => {
      //   resolve(e.target.result);
      resolve(true)
      // };
      // request.onerror = (e) => {
      //   console.error(e);
      // };
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
    // const tx = this.db.transaction(objectStore, 'readonly');
    // const store = tx.objectStore(objectStore);
    // const dataIndex: any = store.index('deleted');
    const promise = new Promise<any>(resolve => {
      // dataIndex.getAll(1).onsuccess = (e) => {
      //   resolve(e.target.result);
      resolve(true);
      // };
    });
    return promise;
  }
}

export default DbService;
