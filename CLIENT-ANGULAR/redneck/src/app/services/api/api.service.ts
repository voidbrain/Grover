import { Injectable } from '@angular/core';
import { SettingsService } from '../settings/settings.service';
import { NetworkService } from '../network/network.service';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { ParamsInterface } from '../../interfaces/utils';
import { PlantExtendedInterface } from '../../interfaces/plant';
import { DoseExtendedInterface } from '../../interfaces/dose';
import { StrainInterface } from '../../interfaces/strain';
import { CompanyInterface } from '../../interfaces/company';
import { WorkerInterface } from '../../interfaces/worker';
import { ProbeInterface } from '../../interfaces/probe';
import { ProbeLogInterface } from '../../interfaces/probeLog';
import { WorkerLogInterface } from '../../interfaces/workerLog';
import { ProbeTypeInterface } from '../../interfaces/probeType';
import { WorkerTypeInterface } from '../../interfaces/workerType';
import { RoomSettingsInterface } from '../../interfaces/settings';

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

  async get<T>(table: string, params?: ParamsInterface): Promise<T> {
    try {
      const response = await this.http.get(`${this.url}${table}`, { params }).toPromise();
      return response;
    } catch (error) {
      console.error(`[API]: Error fetching data from ${table}:`, error);
      throw error; // Propagate the error to the caller
    }
  }

  async post(table: string, 
    items: (PlantExtendedInterface | DoseExtendedInterface | StrainInterface | CompanyInterface | WorkerInterface | ProbeInterface | ProbeLogInterface | WorkerLogInterface | RoomSettingsInterface | ProbeTypeInterface | WorkerTypeInterface)[], 
    params?: ParamsInterface): Promise<unknown> {
    return new Promise((resolve) => {
      if (this.networkService.status && params) {
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

  async delete(table: string, item: Partial<PlantExtendedInterface | DoseExtendedInterface | StrainInterface | CompanyInterface | WorkerInterface | ProbeInterface | ProbeLogInterface | WorkerLogInterface | RoomSettingsInterface | ProbeTypeInterface | WorkerTypeInterface>): Promise<unknown> {
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
    port: number,
    page: string,
    action: string,
    id: number,
    type: string,
    duration?: number,
  ): Promise<HTMLResponse> {
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
