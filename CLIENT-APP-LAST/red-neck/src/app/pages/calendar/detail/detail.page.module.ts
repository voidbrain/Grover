import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SharedModule } from '../../../components/shared.module';
import { CalendarsDetailPageRoutingModule } from './detail-routing.module';
import { CalendarsDetailPage } from './detail.page';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    CalendarsDetailPageRoutingModule
  ],
  declarations: [CalendarsDetailPage]
})
export class CalendarsDetailPageModule {}
