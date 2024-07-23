import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastMsgs: any = [];

  constructor(
    private toastCtrl: ToastController
  ) { }

  async presentToast() {
    let toast = await this.toastCtrl.create({
        message: this.toastMsgs.toString().split(",").join("\n"),
        duration: 3000,
        position: 'top',
        cssClass: 'globe'
    });
    toast.present();
    toast.onDidDismiss().then(() => {
        this.toastMsgs = [];
    });
}

  pushMessage(message: any){
      this.toastMsgs.push(message);
  }
}
