import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum ConnectionStatus {
  Offline,
  Online
}

navigator: {
  onLine: true;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  
  public status: BehaviorSubject<any> ;

  constructor() { 
    this.status = new BehaviorSubject([]);
            this.initializeNetworkEvents();
  }

  watchOnline(): any {
    // return this.network.onConnect();
}

  watchOffline(): any {
    // return this.network.onDisconnect();
  }

  public initializeNetworkEvents() {
    this.updateNetworkStatus(navigator.onLine ? ConnectionStatus.Online : ConnectionStatus.Offline);
    let el = this;
    window.addEventListener('online', function(){el.updateNetworkStatus(ConnectionStatus.Online);});
    window.addEventListener('offline', function(){el.updateNetworkStatus(ConnectionStatus.Offline);});
  }

  private async updateNetworkStatus(status:any) {
      // this.toastService.pushMessage('Network status: '+(status?'Online':'Offline'));
      // this.toastService.presentToast();
      this.status.next(status);
  }
}
