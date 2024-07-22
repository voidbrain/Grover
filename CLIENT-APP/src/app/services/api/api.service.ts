import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { NetworkService } from '../network/network.service';
import { SettingsService } from '../settings/settings.service';


@Injectable({
    providedIn: 'root'
})

export class ApiService {
    url: string = '';

    constructor(
        public http: HttpClient,
        public networkService: NetworkService,
        private appSettings: SettingsService,
    ) {}

    init(){
        this.url = this.appSettings.serverAddress +'/'+ this.appSettings.purposes[this.appSettings.purpose] +'/';
    }

    async get(table: string, params?: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.get(this.url + table, { params: params }).toPromise().then((response) => {
                resolve(response);
            });
        });
    }

    async post(table: string, items: any, params?: any): Promise<any> {
        return new Promise((resolve) => {
            if(this.networkService.status){
                console.info('[API]: network available')
                params.items = items;
                this.http.post(this.url + table, params).subscribe((response) => {
                    resolve(response);
                });
            }else{
                console.warn('[API]: not available')
                items.map(item=>{ item.synced = 0; })
                
                let response = { items : items };
                resolve(response);
            }
        });
    }

    async delete(table: string, item: any): Promise<any> {
        return new Promise((resolve) => {
            if(this.networkService.status){
                console.info('[API]: network available')
                this.http.delete(this.url + table+'?id='+item.id).subscribe((response) => {
                    console.info('[API]: item deleted online: ',item)
                    resolve(item);
                });
            }else{
                console.warn('[API]: network not available')
                item.deleted = 1;
                item.synced = 0;
                console.info('[API]: item deleted offline: ',item)
                resolve(item);
            }
        });
    }
}
