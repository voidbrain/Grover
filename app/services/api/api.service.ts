import { NetworkService } from '../network/network.service';
import { SettingsService } from '../settings/settings.service';
import WebServer from '../server/server';

const https = require('https');

export class ApiService {

	url = '';

	constructor(
		public server: WebServer,
		public networkService: NetworkService,
        private appSettings: SettingsService,
	) {}

	init(){
        this.url = this.appSettings.serverAddress +'/'+ this.appSettings.purposes[this.appSettings.purpose] +'/';
    }

  	async get(table: string, params?: any): Promise<any> {
        return new Promise((resolve) => {
            this.https.requestget(this.url + table, { params }).then((response) => {
    	      	resolve(response);
	    	});
        });
    }

    async post(table: string, item: any, params?: any): Promise<any> {
        return new Promise((resolve) => {
            if(this.networkService.status){
                console.info('[API]: network available');
                params.items = [item];
                this.https.requestpost(this.url + table, params).subscribe((response) => {
                    resolve(response);
                });
            }else{
                console.warn('[API]: not available');
                item.synced = 0;
                const response = { item };
                resolve(response);
            }
        });
    }

    async delete(table: string, item: any): Promise<any> {
        return new Promise((resolve) => {
            if(this.networkService.status){
                console.info('[API]: network available');
                this.https.requestdelete(this.url + table+'?id='+item.id).subscribe((response) => {
                    console.log('[API]: item deleted online: ',item);
                    resolve(item);
                });
            }else{
                console.warn('[API]: network not available');
                item.deleted = 1;
                item.synced = 0;
                console.log('[API]: item deleted offline: ',item);
                resolve(item);
            }
        });
    }
}
