import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SharedModule } from '../../../components/shared.module';
import { DosesDetailPageRoutingModule } from './detail-routing.module';
import { DosesDetailPage } from './detail.page';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    DosesDetailPageRoutingModule
  ],
  declarations: [DosesDetailPage]
})
export class DosesDetailPageModule {}
