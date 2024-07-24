import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SharedModule } from '../../../components/shared.module';
import { CompaniesDetailPageRoutingModule } from './detail-routing.module';
import { CompaniesDetailPage } from './detail.page';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    CompaniesDetailPageRoutingModule
  ],
  declarations: [CompaniesDetailPage]
})
export class CompaniesDetailPageModule {}
