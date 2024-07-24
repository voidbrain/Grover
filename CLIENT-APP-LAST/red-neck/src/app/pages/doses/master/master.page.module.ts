import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import {DosesMasterPageRoutingModule } from './master-routing.module';
import {DosesMasterPage } from './master.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DosesMasterPageRoutingModule
  ],
  declarations: [
   DosesMasterPage,
  ]
})
export class DosesMasterPageModule {}
