import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StrainsMasterPageRoutingModule } from './master-routing.module';
import { StrainsMasterPage } from './master.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StrainsMasterPageRoutingModule
  ],
  declarations: [
    StrainsMasterPage,
  ]
})
export class StrainsMasterPageModule {}
