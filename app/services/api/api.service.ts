import { NetworkService } from '../network/network.service';
import { SettingsService } from '../settings/settings.service';

import * as http from 'http';
import https from 'https';
export class ApiService {

	url = '';

	constructor(
	
		public networkService: NetworkService,
    private appSettings: SettingsService,
	) {}

	init(){
        this.url = this.appSettings.getRemoteServerEndpoint() +'/'+ 
        this.appSettings.getPurposes()[this.appSettings.getPurpose()] +'/';
    }

  	// async get(table: string, params?: any): Promise<any> {
    //   return new Promise((resolve) => {
    //     http.get(this.url + table, params, response => {
    //       resolve(response);
    //     })
    //   });
    // }

    async get(table: string, params?: any) {
        console.log('==>',this.appSettings.getRemoteServerHostname(), this.appSettings.getRemoteServerEndpoint() + table)
      const res = await this.httpsPost({
        hostname: this.appSettings.getRemoteServerHostname(),
        path: this.appSettings.getRemoteServerEndpoint() + table,
        headers: {
            'Authorization': `Bearer 123`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            test1: 'test',
        })
      })
    }

    async httpsGet({body, ...options}) {
      return new Promise((resolve,reject) => {
          const req = https.request({
              method: 'GET',
              ...options,
          }, res => {
              const chunks = [];
              res.on('data', data => chunks.push(data))
              res.on('end', () => {
                  let resBody = Buffer.concat(chunks);
                  switch(res.headers['content-type']) {
                      case 'application/json':
                          resBody = JSON.parse(resBody.toString());
                          break;
                  }
                  resolve(resBody)
              })
          })
          req.on('error',reject);
          if(body) {
              req.write(body);
          }
          req.end();
      })
    };

    async post(table: string, item: any, params?: any) {
      const res = await this.httpsPost({
        hostname: this.appSettings.getRemoteServerHostname(),
        path: this.appSettings.getRemoteServerEndpoint() + table,
        headers: {
            'Authorization': `Bearer 123`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            test1: 'test',
        })
      })
    }

    async httpsPost({body, ...options}) {
      return new Promise((resolve,reject) => {
          const req = https.request({
              method: 'POST',
              ...options,
          }, res => {
              const chunks = [];
              res.on('data', data => chunks.push(data))
              res.on('end', () => {
                  let resBody = Buffer.concat(chunks);
                  switch(res.headers['content-type']) {
                      case 'application/json':
                          resBody = JSON.parse(resBody.toString());
                          break;
                  }
                  resolve(resBody)
              })
          })
          req.on('error',reject);
          if(body) {
              req.write(body);
          }
          req.end();
      })
    };

    
    async delete(table: string, item: any) {
      const res = await this.httpsDelete({
        hostname: this.appSettings.getRemoteServerHostname(),
        path: this.appSettings.getRemoteServerEndpoint() + table,
        headers: {
            'Authorization': `Bearer 123`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            test1: 'test',
        })
      })
    }

    async httpsDelete({body, ...options}) {
      return new Promise((resolve,reject) => {
          const req = https.request({
              method: 'DELETE',
              ...options,
          }, res => {
              const chunks = [];
              res.on('data', data => chunks.push(data))
              res.on('end', () => {
                  let resBody = Buffer.concat(chunks);
                  switch(res.headers['content-type']) {
                      case 'application/json':
                          resBody = JSON.parse(resBody.toString());
                          break;
                  }
                  resolve(resBody)
              })
          })
          req.on('error',reject);
          if(body) {
              req.write(body);
          }
          req.end();
      })
    };

    // async post(table: string, item: any, params?: any): Promise<any> {
    //     return new Promise((resolve) => {
    //         if(this.networkService.status){
    //             console.info('[API]: network available');
    //             params.items = [item];
    //             http.request(this.url + table, params).subscribe((response) => {
    //                 resolve(response);
    //             });
    //         }else{
    //             console.warn('[API]: not available');
    //             item.synced = 0;
    //             const response = { item };
    //             resolve(response);
    //         }
    //     });
    // }

    // async delete(table: string, item: any): Promise<any> {
    //     return new Promise((resolve) => {
    //         if(this.networkService.status){
    //             console.info('[API]: network available');
    //             http.delete(this.url + table+'?id='+item.id, response => {
    //                 console.log('[API]: item deleted online: ',item);
    //                 resolve(item);
    //             });
    //         }else{
    //             console.warn('[API]: network not available');
    //             item.deleted = 1;
    //             item.synced = 0;
    //             console.log('[API]: item deleted offline: ',item);
    //             resolve(item);
    //         }
    //     });
    // }
}

export default ApiService;
