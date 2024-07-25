import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
  public status: BehaviorSubject<any>;

  constructor(private toastService: ToastService) {
    this.status = new BehaviorSubject([]);
    this.initializeNetworkEvents();
  }

  watchOnline(): any {
    console.log(Network.getStatus());
    return Network.getStatus();
  }

  watchOffline(): any {
    return Network.getStatus();
  }

  public initializeNetworkEvents() {
    this.updateNetworkStatus(
      navigator.onLine ? ConnectionStatus.Online : ConnectionStatus.Offline,
    );
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const el = this;
    window.addEventListener('online', function () {
      el.updateNetworkStatus(ConnectionStatus.Online);
    });
    window.addEventListener('offline', function () {
      el.updateNetworkStatus(ConnectionStatus.Offline);
    });
  }

  private async updateNetworkStatus(status: any) {
    this.toastService.pushMessage(
      'Network status: ' + (status ? 'Online' : 'Offline'),
    );
    this.toastService.presentToast();

    this.status.next(status);
  }
}
