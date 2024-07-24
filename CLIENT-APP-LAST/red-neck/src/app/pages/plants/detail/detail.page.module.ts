import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SharedModule } from 'src/app/components/shared.module';
import { PlantsDetailPageRoutingModule } from './detail-routing.module';
import { PlantsDetailPage } from './detail.page';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    PlantsDetailPageRoutingModule
  ],
  declarations: [PlantsDetailPage]
})
export class PlantsDetailPageModule {}
