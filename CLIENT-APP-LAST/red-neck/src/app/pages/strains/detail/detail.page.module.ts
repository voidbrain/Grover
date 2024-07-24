import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SharedModule } from '../../../components/shared.module';
import { StrainsDetailPageRoutingModule } from './detail-routing.module';
import { StrainsDetailPage } from './detail.page';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    StrainsDetailPageRoutingModule
  ],
  declarations: [StrainsDetailPage]
})
export class StrainsDetailPageModule {}
