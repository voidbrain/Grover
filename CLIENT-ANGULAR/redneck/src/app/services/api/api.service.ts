import { Injectable } from '@angular/core';
import { SettingsService } from '../settings/settings.service';
import { NetworkService } from '../network/network.service';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private url = '';
  public debug = true;
  public loadingFlag = true;

  constructor(
    private appSettings: SettingsService,
    public networkService: NetworkService,
    private http: HttpClient,
    public loadingCtrl: LoadingController,
  ) {
    this.init();
  }

  init() {
    if (this.appSettings.purpose !== null) {
      this.url =
        this.appSettings.serverAddress +
        '/' +
        this.appSettings.purposes[this.appSettings.purpose] +
        '/';
    }
  }

  async get(table: string, params?: any): Promise<any> {
    return new Promise((resolve) => {
      this.http
        .get(this.url + table, { params: params })
        .toPromise()
        .then((response: any) => {
          resolve(response);
        });
    });
  }

  async post(table: string, items: any, params?: any): Promise<any> {
    return new Promise((resolve) => {
      if (this.networkService.status) {
        console.info('[API]: network available');
        params.items = items;
        this.http.post(this.url + table, params).subscribe((response: any) => {
          resolve(response);
        });
      } else {
        console.warn('[API]: not available');
        items.map((item: any) => {
          item.synced = 0;
        });

        let response = { items: items };
        resolve(response);
      }
    });
  }

  async delete(table: string, item: any): Promise<any> {
    return new Promise((resolve) => {
      if (this.networkService.status) {
        console.info('[API]: network available');
        this.http
          .delete(this.url + table + '?id=' + item.id)
          .subscribe((response: any) => {
            console.info('[API]: item deleted online: ', item);
            resolve(item);
          });
      } else {
        console.warn('[API]: network not available');
        item.deleted = 1;
        item.synced = 0;
        console.info('[API]: item deleted offline: ', item);
        resolve(item);
      }
    });
  }

  remoteDeviceExecute(
    ip: string,
    port: string,
    page: string,
    action: string,
    id: number,
    type: string,
    duration: number,
  ) {
    return new Promise(async (resolve, reject) => {
      if (this.networkService.status) {
        if (this.debug) {
          console.info('[API]: network available');
        }
        if (this.loadingFlag === false) {
          this.loadingFlag = true;
          const loading = await this.loadingCtrl.create({
            message: 'Please wait&hellip;',
            backdropDismiss: true,
          });
          loading.onDidDismiss().then(() => {
            this.loadingFlag = false;
          });
          loading.present();
          this.http
            .get(
              `http://${ip}:${port}/${page}?action=${action}&duration=${duration}&id=${id}&type=${type}`,
            )
            .subscribe(
              (response) => {
                loading.dismiss();
                // this.loadingFlag = false;
                resolve(response);
              },
              (error) => {
                loading.dismiss();
                // this.loadingFlag = false;
                reject(error);
              },
            );
        }
      } else {
        const response = '[API]: network not available';
        if (this.debug) {
          console.warn(response);
        }
        reject(response);
      }
    });
  }
}
