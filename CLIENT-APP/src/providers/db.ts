import {Injectable} from "@angular/core";
import { HttpParams, HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Platform } from "ionic-angular";
import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';

import {Company} from "../models/models";
import {Medium} from "../models/models";
import {Plant} from "../models/models";
import {Scenario} from "../models/models";
import {Calendarmantask} from "../models/models";
import {Strain} from "../models/models";

@Injectable()
export class DbProvider {

    private db: IDBDatabase;

    constructor(
        private readonly http: HttpClient,
        private appVersion: AppVersion, 
        private device: Device, 
        private platform: Platform) {}

    initProvider(): Promise<void> {
        let promise = this.initDb();
       if(1){
       // if (!navigator.onLine) {
            return promise;
        }
        const server_url = (!this.platform.is('cordova')?"/api":"http://voidbrain.net/grover/ajax/moduli/api");
        var lastUpdate = [];
        lastUpdate["companies"]          = localStorage.getItem('companies');
        lastUpdate["mediums"]            = localStorage.getItem('mediums');
        lastUpdate["plants"]             = localStorage.getItem('plants');
        lastUpdate["scenarios"]          = localStorage.getItem('scenarios');
        lastUpdate["calendarmantasks"]   = localStorage.getItem('calendarmantasks');
        lastUpdate["strains"]            = localStorage.getItem('strains');
        promise = promise
        .then(() => this.loadData(server_url+'/'+'companies',          lastUpdate["companies"],         'companies'))
        .then(() => this.loadData(server_url+'/'+'mediums',            lastUpdate["mediums"],           'mediums'))
        .then(() => this.loadData(server_url+'/'+'plants',             lastUpdate["plants"],            'plants'))
        .then(() => this.loadData(server_url+'/'+'scenarios',          lastUpdate["scenarios"],         'scenarios'))
       ////////////// .then(() => this.loadData(server_url+'/'+'calendarmantasks',   lastUpdate["calendarmantasks"],  'calendarmantasks'))
        .then(() => this.loadData(server_url+'/'+'strains',            lastUpdate["strains"],           'strains'))
        return promise;        
    }
      
    private initDb(): Promise<void> {
        if (this.db) {
            this.db.close();
        }
        return new Promise(resolve => {
            const openRequest = indexedDB.open("GROVER");
            openRequest.onupgradeneeded = event => {
                const target: any = event.target;
                const db = target.result;
                console.log(db.version);
                //if(!db.version||db.version==0){

                    const storeCompanies           = db.createObjectStore('companies', {keyPath: 'id'});
                    const storeMediums             = db.createObjectStore('mediums', {keyPath: 'id'});
                    const storePlants              = db.createObjectStore('plants', {keyPath: 'id'});
                    const storeScenarios           = db.createObjectStore('scenarios', {keyPath: 'id'});
                    //const storeCalendarmantasks    = db.createObjectStore('calendarmantasks', {keyPath: 'id'});
                    const storeStrains             = db.createObjectStore('strains', {keyPath: 'id'});

                    storeCompanies.createIndex('id', 'id');
                    //storeCompanies.createIndex('name', 'name');
                    storeMediums.createIndex('id', 'id');
                    //storeMediums.createIndex('name', 'name');
                    storePlants.createIndex('day_start_grow', 'day_start_grow');
                    // storePlants.createIndex('day_start_bloom', 'day_start_bloom');
                    // storePlants.createIndex('day_harvest', 'day_harvest');
                    //storePlants.createIndex('man_tasks', 'man_tasks[0].day', {unique:false});
                    storeScenarios.createIndex('id', 'id');
                    //storeScenarios.createIndex('name', 'name');
                    //storeCalendarmantasks.createIndex('id', 'id');
                    storeStrains.createIndex('id', 'id');
                //}
            };
            openRequest.onsuccess = event => {
                this.db = (<any>event.target).result;
                this.db.onerror = event => {
                    console.log(event);
                };
                resolve();
            }
        });
    }

    private loadData(dataUrl,lastUpdate,objectStore): Promise<void> {
        return new Promise(resolve => {
            let params = new HttpParams();
            params = params.append("db_version", String(this.db.version));
            params = params.append("last_update",lastUpdate);
            if (this.platform.is('cordova')) {
                var appName;
                var packageName;
                var versionCode;
                var versionNumber;
                this.appVersion.getAppName().then((s) => { appName = s; })
                this.appVersion.getPackageName().then((s) => { packageName = s; })
                this.appVersion.getVersionCode().then((s) => { versionCode = s; })
                this.appVersion.getVersionNumber().then((s) => { versionNumber = s; })

                params = params.append("app_name",appName);
                params = params.append("package_name",packageName);
                params = params.append("version_code",versionCode);
                params = params.append("version_number",versionNumber);

                params = params.append("uuid", this.device.uuid);
                params = params.append("model", this.device.model);
                params = params.append("cordova", this.device.cordova);
                params = params.append("platform", this.device.platform);
                params = params.append("version", this.device.version);
                params = params.append("manufacturer", this.device.manufacturer);
                params = params.append("serial", this.device.serial);
            }else{
                params = params.append("app_name","GROVER");
                params = params.append("package_name","");
                params = params.append("version_code","");
                params = params.append("version_number","");

                params = params.append("uuid", "dev-01");
                params = params.append("platform", "browser");
                params = params.append("model", "");
                params = params.append("cordova", "");
                params = params.append("version", "");
                params = params.append("manufacturer", "");
                params = params.append("serial", "");
            }
            
            const data = this.http.get(dataUrl, {params: params}).subscribe((data) => {
                const tx = this.db.transaction(objectStore, 'readwrite');
                const store = tx.objectStore(objectStore);
                for (let el in data) {
                    let row = data[el];
                    if (row.id) {
                        switch (objectStore) {
                            case "companies":
                                store.put({                 
                                    name: row.name, abilitato: Number(row.abilitato), last_update: Number(row.last_update), cancellato: Number(row.cancellato), id: row.id
                                });
                            break;
                            case "mediums":
                                store.put({                 
                                    name: row.name, abilitato: Number(row.abilitato), last_update: Number(row.last_update), cancellato: Number(row.cancellato), id: row.id
                                });
                            break;
                            case "plants":
                                store.put({                 
                                    id_strain:                Number(row.id_strain),
                                    id_company:               Number(row.id_company),
                                    id_growing_scenario:      Number(row.id_growing_scenario),
                                    id_growing_medium:        Number(row.id_growing_medium),     
                                    generation:               Number(row.generation),   
                                    day_start_grow:           Number(row.day_start_grow),        
                                    // day_start_bloom:          Number(row.day_start_bloom),        
                                    // day_harvest:              Number(row.day_harvest),  
                                    yeld:                     Number(row.yeld),   
                                    man_tasks:                row.man_tasks,        
                                    notes:                    row.notes,        
                                    abilitato:                Number(row.abilitato),
                                    last_update:              Number(row.last_update),
                                    cancellato:               Number(row.cancellato),
                                    id:                       row.id
                                });
                            break;
                            case "scenarios":
                                store.put({                 
                                    name: row.name, abilitato: Number(row.abilitato), last_update: Number(row.last_update), cancellato: Number(row.cancellato), id: row.id
                                });
                            break;
                            
                            case "strains":
                                store.put({                 
                                    name:                     row.name,
                                    lineage:                  row.lineage,
                                    percent_sativa:           Number(row.percent_sativa),
                                    abilitato:                Number(row.abilitato),
                                    last_update:              Number(row.last_update),
                                    cancellato:               Number(row.cancellato),
                                    id:                       row.id
                                });
                            break;
                            
                            default:
                            break;
                        }
                    }
                }
                tx.oncomplete = e => {
                    localStorage.setItem(objectStore, Date.now().toString());
                    resolve();
                };
            });
        });
    }

    // filter(company=null): Promise<Company[]> {
    //     const tx = this.db.transaction('companies', 'readonly');
    //     const store = tx.objectStore('companies');
    //     const dataCompaniesIndex: any = store.index('name');
    //     let promise = new Promise<Company[]>(resolve => {
    //         if(company){
    //              dataCompaniesIndex.get(plant).onsuccess = e => resolve(e.target.result);
    //         }else{
    //             dataCompaniesIndex.getAll().onsuccess = e => resolve(e.target.result);     
    //         }
    //     });
    //     return promise; //.then(e => e.sort());
    // }

    filterCompanies(item=null,column="id"): Promise<Company[]> {
        const tx = this.db.transaction('companies', 'readonly');
        const store = tx.objectStore('companies');
        const dataIndex: any = store.index(column);
        let promise = new Promise<Company[]>(resolve => {
            if(item){
                 dataIndex.get(item).onsuccess = e => resolve(e.target.result);
            }else{
                dataIndex.getAll().onsuccess = e => resolve(e.target.result);     
            }
           
        });
        return promise;
    }
    filterMediums(item=null,column="id"): Promise<Medium[]> {
        const tx = this.db.transaction('mediums', 'readonly');
        const store = tx.objectStore('mediums');
        const dataIndex: any = store.index(column);
        let promise = new Promise<Medium[]>(resolve => {
            if(item){
                 dataIndex.get(item).onsuccess = e => resolve(e.target.result);
            }else{
                dataIndex.getAll().onsuccess = e => resolve(e.target.result);     
            }
           
        });
        return promise;
    }
    filterPlants(item=null,column="id"): Promise<Plant[]> {
        const tx = this.db.transaction('plants', 'readonly');
        const store = tx.objectStore('plants');
        const dataIndex: any = store.index('day_start_grow');
        let promise = new Promise<Plant[]>(resolve => {
            if(item){
                 dataIndex.get(item).onsuccess = e => resolve(e.target.result);
            }else{
                dataIndex.getAll().onsuccess = e => resolve(e.target.result); 
            }
        });
        return promise.then(e => e.sort((a, b) => b.day_start_grow - a.day_start_grow));
        //return promise;
    }
    filterScenarios(item=null,column="id"): Promise<Scenario[]> {
        const tx = this.db.transaction('scenarios', 'readonly');
        const store = tx.objectStore('scenarios');
        const dataIndex: any = store.index(column);
        let promise = new Promise<Scenario[]>(resolve => {
            if(item){
                 dataIndex.get(item).onsuccess = e => resolve(e.target.result);
            }else{
                dataIndex.getAll().onsuccess = e => resolve(e.target.result);     
            }
           
        });
        return promise;
    }
    // filterCalendarmantasks(item=null,column="id"): Promise<Calendarmantask[]> {
    //     const tx = this.db.transaction('calendarmantasks', 'readonly');
    //     const store = tx.objectStore('calendarmantasks');
    //     const dataIndex: any = store.index(column);
    //     let promise = new Promise<Calendarmantask[]>(resolve => {
    //         if(item){
    //              dataIndex.get(item).onsuccess = e => resolve(e.target.result);
    //         }else{
    //             dataIndex.getAll().onsuccess = e => resolve(e.target.result);     
    //         }
           
    //     });
    //     return promise;
    // }
    filterStrains(item=null,column="id"): Promise<Strain[]> {
        const tx = this.db.transaction('strains', 'readonly');
        const store = tx.objectStore('strains');
        const dataIndex: any = store.index(column);
        let promise = new Promise<Strain[]>(resolve => {
            if(item){
                 dataIndex.get(item).onsuccess = e => resolve(e.target.result);
            }else{
                dataIndex.getAll().onsuccess = e => resolve(e.target.result);     
            }
           
        });
        return promise;
    }
}
