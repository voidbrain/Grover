import { Injectable } from '@angular/core';
import { SettingsService } from '../settings/settings.service';
import { NetworkService } from '../network/network.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { HTMLResponse, ParamsInterface } from '../../interfaces/utils';
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

  // Initialization
  init() {
    if (this.appSettings.purpose !== null) {
      this.url =
        this.appSettings.serverAddress +
        '/' +
        this.appSettings.purposes[this.appSettings.purpose] +
        '/';
    }
  }

  // GET Request
  async get<T>(table: string, params?: HttpParams): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.get<T>(`${this.url}${table}`, { params })
      );
      return response;
    } catch (error) {
      console.error(`[API]: Error fetching data from ${table}:`, error);
      throw error; // Propagate the error to the caller
    }
  }

  // POST Request
  async post(
    table: string,
    items: (
      PlantExtendedInterface | 
      DoseExtendedInterface | 
      StrainInterface | 
      CompanyInterface | 
      WorkerInterface | 
      ProbeInterface | 
      ProbeLogInterface | 
      WorkerLogInterface | 
      RoomSettingsInterface | 
      ProbeTypeInterface | 
      WorkerTypeInterface
    )[],
    params?: ParamsInterface
  ): Promise<object> {
    const networkStatus = this.networkService.status.value; // Assume it's a signal or method returning the status
    return new Promise<object>((resolve, reject) => {
      if (networkStatus && params) {
        console.info('[API]: network available');
        params.items = items;
        this.http.post(`${this.url}${table}`, params).subscribe(
          (response) => resolve(response),
          (error) => reject(error)
        );
      } else {
        console.warn('[API]: network not available');
        items.forEach((item) => (item.synced = 0));

        const response = { items: items };
        resolve(response);
      }
    });
  }

  // DELETE Request
  async delete(
    table: string,
    item: Partial<
      PlantExtendedInterface | DoseExtendedInterface | StrainInterface | CompanyInterface | WorkerInterface | ProbeInterface | ProbeLogInterface | WorkerLogInterface | RoomSettingsInterface | ProbeTypeInterface | WorkerTypeInterface
    >
  ): Promise<unknown> {
    const networkStatus = this.networkService.status.value; // Signal or observable

    return new Promise((resolve, reject) => {
      if (networkStatus) {
        console.info('[API]: network available');
        this.http.delete(`${this.url}${table}?id=${item.id}`).subscribe(
          () => {
            console.info('[API]: item deleted online:', item);
            resolve(item);
          },
          (error) => reject(error)
        );
      } else {
        console.warn('[API]: network not available');
        item.deleted = 1;
        item.synced = 0;
        console.info('[API]: item deleted offline:', item);
        resolve(item);
      }
    });
  }

  // Execute Remote Device Command
  async remoteDeviceExecute(
    ip: string,
    port: number,
    page: string,
    action: string,
    id: number,
    type: string,
    duration?: number,
  ): Promise<HTMLResponse> {
    const networkStatus = this.networkService.status.value;

    if (!networkStatus) {
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
      const response = await firstValueFrom(this.http.get<HTMLResponse>(url));

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
