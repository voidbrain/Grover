import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CalendarsMasterPageRoutingModule } from './master-routing.module';
import { CalendarsMasterPage } from './master.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarsMasterPageRoutingModule
  ],
  declarations: [
    CalendarsMasterPage,
  ]
})
export class  CalendarsMasterPageModule {}
