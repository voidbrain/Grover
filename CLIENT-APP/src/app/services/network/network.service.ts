import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { Platform } from '@ionic/angular';
import { ToastService } from '../toast/toast.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export enum ConnectionStatus {
    Offline,
    Online
}

@Injectable({
    providedIn: 'root'
})
export class NetworkService {
    
    public status:any;
    
    constructor(
        private network: Network, 
        private plt: Platform,
        private toastService: ToastService
    ) {
        this.plt.ready().then(() => {
            this.status = new BehaviorSubject([]);
            this.initializeNetworkEvents();
        });
    }

    watchOnline(): any {
        return this.network.onConnect();
    }

    watchOffline(): any {
        return this.network.onDisconnect();
    }
 
    public initializeNetworkEvents() {
        if(this.plt.is('desktop')){
            this.updateNetworkStatus(navigator.onLine ? ConnectionStatus.Online : ConnectionStatus.Offline);
            let el = this;
            window.addEventListener('online', function(){el.updateNetworkStatus(ConnectionStatus.Online);});
            window.addEventListener('offline', function(){el.updateNetworkStatus(ConnectionStatus.Offline);});
        }else{
            console.info('[NETWORK]: native')
            this.updateNetworkStatus(this.network.type ? ConnectionStatus.Online : ConnectionStatus.Offline);
            this.network.onConnect().subscribe(() => { this.updateNetworkStatus(ConnectionStatus.Online);});
            this.network.onDisconnect().subscribe(() => { this.updateNetworkStatus(ConnectionStatus.Offline);});
        }
    }
    private async updateNetworkStatus(status) {
        this.toastService.pushMessage('Network status: '+(status?'Online':'Offline'));
        this.toastService.presentToast();
        this.status.next(status);
    }
}
