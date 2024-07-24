import { Injectable } from '@angular/core';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform, ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    private toastMsgs: any = [];

    constructor(
        private plt: Platform,
        private toastCtrl: ToastController
    ) {
        this.plt.ready().then(() => {});
    }

    async presentToast() {
        const toast = await this.toastCtrl.create({
            message: this.toastMsgs.toString().split(',').join('\n'),
            duration: 3000,
            position: 'top',
            cssClass: 'globe'
        });
        toast.present();
        toast.onDidDismiss().then(() => {
            this.toastMsgs = [];
        });
    }

    pushMessage(message){
        this.toastMsgs.push(message);
    }
}
