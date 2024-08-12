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

  async get<T>(table: string, params?): Promise<T> {
    try {
      const response = await this.http.get<T>(`${this.url}${table}`, { params }).toPromise();
      return response;
    } catch (error) {
      console.error(`[API]: Error fetching data from ${table}:`, error);
      throw error; // Propagate the error to the caller
    }
  }

  async post(table: string, items, params?): Promise<unknown> {
    return new Promise((resolve) => {
      if (this.networkService.status) {
        console.info('[API]: network available');
        params.items = items;
        this.http.post(this.url + table, params).subscribe((response) => {
          resolve(response);
        });
      } else {
        console.warn('[API]: not available');
        items.map((item) => {
          item.synced = 0;
        });

        const response = { items: items };
        resolve(response);
      }
    });
  }

  async delete(table: string, item): Promise<unknown> {
    return new Promise((resolve) => {
      if (this.networkService.status) {
        console.info('[API]: network available');
        this.http.delete(this.url + table + '?id=' + item.id).subscribe(() => {
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

  async remoteDeviceExecute(
    ip: string,
    port: string,
    page: string,
    action: string,
    id: number,
    type: string,
    duration: number,
  ): Promise<unknown> {
    if (!this.networkService.status) {
      const response = '[API]: network not available';
      if (this.debug) {
        console.warn(response);
      }
      return Promise.reject(response);
    }
  
    if (this.debug) {
      console.info('[API]: network available');
    }
  
    if (this.loadingFlag) {
      return Promise.reject('[API]: Loading in progress, please wait...');
    }
  
    this.loadingFlag = true;
  
    const loading = await this.loadingCtrl.create({
      message: 'Please wait&hellip;',
      backdropDismiss: true,
    });
  
    try {
      await loading.present();
  
      const url = `http://${ip}:${port}/${page}?action=${action}&duration=${duration}&id=${id}&type=${type}`;
      const response = await this.http.get(url).toPromise();
  
      return response;
    } catch (error) {
      if (this.debug) {
        console.error('[API]: Error executing remote command:', error);
      }
      return Promise.reject(error);
    } finally {
      this.loadingFlag = false;
      await loading.dismiss();
    }
  }
  
}
