import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Plant } from "../../models/models";
import { Strain } from "../../models/models";
import { DbProvider } from "../../providers/providers";

@IonicPage()
@Component({
  selector: 'page-plants-detail',
  templateUrl: 'plants-detail.html'
})
export class PlantsDetailPage {
  item: any;


  constructor(public navCtrl: NavController, navParams: NavParams, items: DbProvider) {
    this.item = navParams.get('item');
  }

}
