import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
import { signal } from "@angular/core";
import { Network } from '@capacitor/network';
import { ToastService } from '../toast/toast.service';

export enum ConnectionStatus {
  Offline,
  Online,
}

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  public status = signal("");

  constructor(private toastService: ToastService) {
   
    this.initializeNetworkEvents();
  }

  watchOnline() {
    console.log(Network.getStatus());
    return Network.getStatus();
  }

  watchOffline() {
    return Network.getStatus();
  }

  public initializeNetworkEvents() {
    this.updateNetworkStatus(
      navigator.onLine ? ConnectionStatus.Online : ConnectionStatus.Offline,
    );

    window.addEventListener('online', () => {
      this.updateNetworkStatus(ConnectionStatus.Online);
    });
    window.addEventListener('offline', () => {
      this.updateNetworkStatus(ConnectionStatus.Offline);
    });
  }

  private async updateNetworkStatus(status: number) {
    this.toastService.pushMessage(
      'Network status: ' + (status ? 'Online' : 'Offline'),
    );
    this.toastService.presentToast();

    this.status.set(ConnectionStatus[status]);
  }
}
