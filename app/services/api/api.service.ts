import { NetworkService } from '../network/network.service';
import { SettingsService } from '../settings/settings.service';

import * as http from 'http';
import https from 'https';
export class ApiService {
  
  url = '';
  
  constructor(
    
    public networkService: NetworkService,
    private settings: SettingsService,
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
    
    async get(endpont: string, lastUpdate?: any, action?: any, serialNumber?: any) {
      const path = `${this.settings.getRemoteServerEndpoint()}${endpont}` + 
      `?lastUpdate=${lastUpdate}&action=${action}&serialNumber=${serialNumber}`;
      
      const res = await this.httpsGet({
        hostname: this.settings.getRemoteServerHostname(),
        path
      })
      return res;
    }
    
    async httpsGet({...options}) {
      console.log( `https://${options.hostname}/${options.path}`)
      return new Promise((resolve, reject) => {
        const url = `https://${options.hostname}/${options.path}`;
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
            // const parseJSON = (data) => {
            //   if (data) {
            //     try {
            //       return JSON.parse(data);
            //     } catch (e) {
            //       return false;
            //     }
            //   }
            // };
            // if(parseJSON) {
            //   console.log('#####');
            //   console.log(parseJSON);
            //   console.log('#####');

            //   resolve(parseJSON);
            // } else {
            //   reject
            // }
          });

        }).on("error", (err) => {
          console.log("Error: " + err.message);
          reject;
        });
      //   const req = https.request({
      //     method: 'GET',
      //     ...options,
      //   }, res => {
      //     const chunks = [];
      //     res.on('data', data => chunks.push(data))
      //     res.on('end', () => {
      //       let resBody = Buffer.concat(chunks);
            
      //       switch(res.headers['content-type']) {
      //         case 'application/json':
      //         resBody = JSON.parse(resBody.toString());
      //         break;
      //       }     
      //       console.log("resBody => ", resBody, res.headers['content-type'])             
      //       resolve(resBody)
      //     })
      //   })
      //   req.on('error',reject);
      //   if(body) {
      //     req.write(body);
      //   }
      //   req.end();
      });
    };
    
    async post(table: string, item: any, params?: any) {
      const res = await this.httpsPost({
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
  