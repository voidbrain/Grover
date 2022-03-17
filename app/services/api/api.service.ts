import { NetworkService } from '../network/network.service';
import { SettingsService } from '../settings/settings.service';

import * as http from 'http';
import https from 'https';
import axios from 'axios';
export class ApiService {
  
  url = '';
  settings = new SettingsService();
  network = new NetworkService();
  constructor(
    ) {}
    
    init(){
      this.url = this.settings.getRemoteServerEndpoint() +'/'+ 
      this.settings.getPurposes()[this.settings.getPurpose()] +'/';
    }
    
    // async get(table: string, params?: any): Promise<any> {
    //   return new Promise((resolve) => {
    //     http.get(this.url + table, params, response => {
    //       resolve(response);
    //     })
    //   });
    // }
    
    async get(endpont: string, lastUpdate?: any, action?: any, serialNumber?: any, port?: any) {
      return new Promise(async (resolve, reject) => {
        const path = `${this.settings.getRemoteServerEndpoint()}${endpont}` + 
        `?lastUpdate=${lastUpdate}&action=${action}&serialNumber=${serialNumber}&port=${port}`;
        
        const res = await this.httpsGet({
          hostname: this.settings.getRemoteServerHostname(),
          path
        })
        resolve(res);
      });
    }
    
    async httpsGet({...options}) {
      return new Promise((resolve, reject) => {
        const url = `${options.hostname}/${options.path}`;
        https.get(url, resp => {
          let data = '';

          // A chunk of data has been received.
          resp.on('data', (chunk) => {
            data += chunk;
          });

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            let parseJSON = {}
            try {
              parseJSON = JSON.parse(data);
              resolve(parseJSON);
            } catch(e) {
              reject
            }
          });

        }).on("error", (err) => {
          console.log("[API]: Error: " + err.message);
          reject;
        });
      });
    };
    
    async post(endpont: string, lastUpdate: any, action: any, item: any, serialNumber: any) {
      const path = `${this.settings.getRemoteServerHostname()}/${this.settings.getRemoteServerEndpoint()}${endpont}` + 
        `?lastUpdate=${lastUpdate}&action=${action}`;
      const body = {item, serialNumber};
      console.log("############")
      console.log(path, body)
      console.log("----------------")
      const res = await this.httpsPost(path, body);
      console.log(res);
      console.log("?????????????????")
      return res;
    }
    
    async httpsPost(path, body) {
      return new Promise((resolve,reject) => {
        axios({
          method: 'POST',
          url: path,
          data: body
        }).then(function (response) {
          resolve(response.data);
        }).catch(err => {
          console.log("[API]: POST error", err);
          reject;
        });
      })
    };
    
    
    async delete(table: string, item: any) {
      const res = await this.httpsDelete({
        hostname: this.settings.getRemoteServerHostname(),
        path: this.settings.getRemoteServerEndpoint() + table,
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
  