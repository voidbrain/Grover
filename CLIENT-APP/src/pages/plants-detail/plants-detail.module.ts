import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { PlantsDetailPage } from './plants-detail';

@NgModule({
  declarations: [
    PlantsDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(PlantsDetailPage),
    TranslateModule.forChild()
  ],
  exports: [
    PlantsDetailPage
  ]
})
export class PlantsDetailPageModule { }
