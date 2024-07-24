import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CompaniesMasterPageRoutingModule } from './master-routing.module';
import { CompaniesMasterPage } from './master.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompaniesMasterPageRoutingModule
  ],
  declarations: [
    CompaniesMasterPage,
  ]
})
export class CompaniesMasterPageModule {}
