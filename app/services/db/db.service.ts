import { LocationInterface } from '../../interfaces/location';
import { RoomInterface } from '../../interfaces/room';
import { PotInterface } from '../../interfaces/pot';

import { LocalStorage } from 'node-localstorage';
import sqlite3 from 'sqlite3';
import * as path from 'path';

export class DbService {

  settings;
  api;

	private db;
  private serialNumber;
	private tables = [];
  private localStorage = new LocalStorage('./data/scratch');
  private debug = false;

  	constructor(
      settings, api
    ) {
        this.settings = settings;
        this.api = api;
        this.tables = this.settings.getTables();
        this.api.init();
    }

    async load(): Promise<any> {
      const self = this;
      return new Promise<void>(async (resolve, reject)=> {
        if (self.debug) { console.log(`[DB]: load`); }
        self.serialNumber = (await self.settings.getSerialNumber());
        const resetDb = false; const forceLoading = true;
        self.initService((resetDb?resetDb:forceLoading)).then(async ()=>{
          const networkStatus = 'Online';
          resolve();
        })
        .catch(() => { reject(); });
      });
    }

    // async load(): Promise<any> {
    //   const self = this;
    //   return new Promise<void>(async (resolve, reject)=> {
    //     self.serialNumber = (await self.settings.getSerialNumber()).split(': ')[1];
    //       const resetDb = false; const forceLoading = true;
    //       self.initDb(resetDb).then(async ()=>{
    //           self.initService((resetDb?resetDb:forceLoading)).then(async ()=>{
    //               // self.api.networkService.status.subscribe((networkStatus) => {
    //               //     if(self.debug) { console.info('[DB]: Network status: ' + (networkStatus ? 'Online' : 'Offline'));}
    //                   const networkStatus = 'Online';
    //                   // await self.syncAndClean(networkStatus).then(()=>{
    //                       resolve();
    //                   // });
    //               // });
    //           })
    //           .catch(() => {
    //             console.error('Err1');
    //             reject();
    //         })
    //       });
    //   });
    // }

    // async deleteDb(): Promise<any> {
    //   const self = this;
    //   self.localStorage.clear();
    //   const pathToFile = './data/grover.sqlite';
    //   // if (fs.existsSync(pathToFile)) {
    //   //   fs.unlinkSync(pathToFile)
    //   // }
    //   if(self.debug) { console.info('[DB]: Db deleted');}
    //   return;
    // }

    private openDb(): Promise<void> {
      const self = this;
        return new Promise((resolve, reject) => {
          if(self.debug) { console.log(`[DB]: openDb`); }
            const __dirname = path.resolve();
            self.db = new sqlite3.Database(__dirname+'/data/db.sqlite', sqlite3.OPEN_READWRITE, err => { 
              if (err) {
                console.error('[DB]: error openDb: ' + err.message);
                reject();
              } else {
                resolve();
              }
            });
        });
    }

    // async initDb(resetDb=false): Promise<any> {
    //   const self = this;
    //   return new Promise<void>(resolve => {
    //     if(resetDb===true){
    //       if(self.debug) { console.info('[DB]: Delete db');}
    //       self.deleteDb().then(()=>{ resolve(); });
    //     }else{
    //       if(self.debug) { console.info('[DB]: Delete db not required');}
    //       resolve();
    //     }
    //   });
    // }

    async initService(forceLoading=false): Promise<void> {
      const self = this;
      // const networkStatus = this.api.networkService.status._value;
      const networkStatus = true;
      const date = new Date();
      const now = Date.now();
      const lastUpdate = []; const promises = [];
      if(self.debug) { console.log(`[DB]: init service`); }
      const promiseOpenDb = await this.openDb();

      const lastGlobalUpdate = ( self.localStorage.getItem(self.settings.getAppName()+'_lastglobalupdate') || date.getDate()-1 );
      const hoursWithoutUpdates = (Number(now) - Number(lastGlobalUpdate)) / (1000*60*60);

      if (!networkStatus || (hoursWithoutUpdates<1 && forceLoading===false)) {
        if(self.debug) { console.info('[DB]: Cached data');}
        return promiseOpenDb;
      }

      if(self.debug) { console.info('[DB]: Force data sync');}
      self.localStorage.setItem(self.settings.getAppName()+'_lastglobalupdate', String(now));
      // console.log('setitem -> ', String(now))

      if(self.debug) {  console.info('[DB]: Promise all (expected load & syncData)'); }
      Promise.all(
        self.tables.map(async (table) => {
          lastUpdate[table] = self.localStorage.getItem(self.settings.getAppName()+'_'+table);
          if(self.debug) { console.info('[DB]: loadData', table); }
          
          const loadD = await self.loadData(table, lastUpdate[table]); // .then(async loadTab =>);
          // console.log('--> loadTab', loadTab)
          if(self.debug) {  console.info('[DB]: synced', table); }
          
          //   console.info('[DB]: syncData', table);
            
          //   console.info('[DB]: synced', table);
          })
        );
        
        return;
      
      // )
        // .then(async(loadTables) => {
        //   console.info('[DB]: Then');
        //   console.info('[DB]: loadTables');
        //   const results = await self.syncData(loadTables);
        //   return;
        // })
    }

    async loadData(table, lastUpdate): Promise<any> {
      const self = this;
      
      return new Promise(async (resolve, reject) => {
        const res = self.api.get(table, lastUpdate, 'read', this.serialNumber).then(async (res) =>{
          resolve( await self.syncData({[table] : res}));
        }).catch((err) => {
          reject(err)
        })
      });
    }

    async syncData(data){
      const self = this;
     
      if(self.debug) {console.info('[DB]: entering sync data'); }
      return new Promise<void>(async (resolve, reject) => {
        // dataValues.map(async (data)=>{
          
          const table = Object.keys(data)[0];
          const res = data[table];
          if(self.debug) { console.info('[DB]: Db Sync records ready ',table);}
          
          if(res.items){
            const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (
            ${res.tableDefinition.map(el => {
              const definition = el;
              return `${definition.name} ${definition.type} ${definition.primary_key ? 'primary key' : ''}`;
            })})`;


            const create = self.db.run(createTableQuery, async function(err) {
              if (err) {
                console.error(err.message);
                reject();
              } else { if(self.debug){console.log(`[DB] Table ${table} ok`); }}
              
              const promises = await res.items.map(row => {
                if (row.id) {
                  let promise;
                  if(row.deleted){ 
                    promise = self.db.run(`DELETE FROM ${table} WHERE id=?`, +row.id, function(err) {
                      if (err) {
                        return console.error(err.message);
                      }
                      if(self.debug){console.log(`[DB] Row(s) deleted ID ${row.id}`);}
                    });
                  }else{
                    let length;
                    const values:any[] = [];
                    const cols:string[] = [];
                    Object.keys(row).forEach(function(key, index) {
                      length = index;
                      cols.push(key);
                      values.push(row[key]);
                    });
                    const query = `INSERT or REPLACE into ${table}(${cols.map(el => el)}) values (${'?,'.repeat(length)}?)`;
                    self.db.run(query, values, (err) => {
                      if(err) {
                        console.log('err')
                        reject;
                        throw err;
                      }

                      resolve();
                    });
                  }
                  
                }
              });
            });
          }else{ resolve(); }
        // });
      });
    }

    async getItem(table, value, column='id'): Promise<LocationInterface | RoomInterface | PotInterface> {
      const self = this;
      const promise = new Promise<LocationInterface | RoomInterface | PotInterface>(resolve => {
          if(value){
            const query = `SELECT * from ${table} WHERE ${column}=(?)`;
            // console.log('[DB]: get', query, [value])
            self.db.get(query, [value], (err, row) => {
              if(err) {
                console.log(err)
                throw err;
              }
              resolve(row);
            });
          } else {
            resolve(null);
          }      
      });
      return promise;
    }

    async findParent(id): Promise<RoomInterface | PotInterface> {
      const self = this;
      const promise = new Promise<RoomInterface | PotInterface>(resolve => {
          if(id){
            const query = `
            SELECT ROOMS.*, ROOMS.name AS roomName, 
            POTS.*, POTS.name AS potName, 
            LOCATIONS.* FROM LOCATIONS
            LEFT JOIN POTS on POTS.locationId = LOCATIONS.id 
            LEFT JOIN ROOMS on ROOMS.locationId = LOCATIONS.id 
            WHERE LOCATIONS.id=(?)`;
            self.db.get(query, [id], (err, row) => {
              if(err) {
                console.log(err)
                throw err;
              }
              resolve(row);
            });
          } else {
            resolve(null);
          }      
      });
      return promise;
    }

    closeDb() {
      this.db.close((err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Close the database connection.');
      });
    }

    async getItems(table: string, value: number = null, column: string = 'id'): Promise<LocationInterface[] | RoomInterface[] | any[]> {
      const self = this;
      
      
      const promise = new Promise<LocationInterface[] | RoomInterface[]>(resolve => {
          
        // console.info('[DB]: getitems');
        let query = `SELECT * from ${table}`;
          const where = [];
          if(value) { where.push(value); query += ` where ${column}=(?)`; }
          // console.log(query, where)
          self.db.all(query, where, (err, rows) => {
            if(err) {
              throw err;
            }
            resolve(rows);
          });
      });
      
      return promise;
    }

    async putItem(table, item: LocationInterface | RoomInterface): Promise<void>{
      const self = this;
      
      
        if(!item.id){ delete item.id; }
        const lastUpdate = this.localStorage.getItem(this.settings.getAppName()+'_'+table);
        const params = { lastUpdate };
        this.api.post(table, item, params)
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
      
    }

    async deleteItem(objectStore, itemToDelete: any): Promise<void>{
      const self = this;
        console.log(objectStore, itemToDelete);
        this.api.delete(objectStore, itemToDelete)
          .then((item:any) => {
            // const tx = this.db.transaction(objectStore, 'readwrite');
            // const store = tx.objectStore(objectStore);
            if(item.synced!==0){
              // const objectStoreRequest = store.delete(item.id);
              // objectStoreRequest.onsuccess = function(event) {
              //   if(self.debug) { console.info('[DB]: item deleted. Table: "'+objectStore+'" id:'+item.id);}
              //   resolve();
              // };
              // resolve();
              return;
            }else{
              if(self.debug) {
                console.info('[DB]: item still not synced, don\'t remove from db but set to deleted:1. Table: "'
                +objectStore+'" id:'+item.id);
              }
              item.deleted = 1;
              // const tx1 = this.db.transaction(objectStore, 'readwrite');
              // const store1 = tx1.objectStore(objectStore);
              // const promise = store1.put(item);
              // promise.onsuccess = function(e){
              //     resolve();
              // };
              // promise.onerror = function(e){
              //     console.error('[DB]: Error adding: '+e);
              // };
            }
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
        // console.log('getItemsToBeSynced');
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

  getItemsToBeSynced(table): Promise<any>{
    const self = this;
      const promise = new Promise<LocationInterface[] | RoomInterface[] | any[]>(resolve => {
        // console.info('[DB]: getitemstobesynced');
          const query = `SELECT * from ${table} where sinced=(0)`;
          self.db.all(query, (err, rows) => {
            if(err) {
              throw err;
            }
            // resolve(rows);
            resolve([]);
          });
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
