import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SharedModule } from '../../../components/shared.module';
import { PlantsMasterPageRoutingModule } from './master-routing.module';
import { PlantsMasterPage } from './master.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    FormsModule,
    PlantsMasterPageRoutingModule,
    FontAwesomeModule
  ],
  declarations: [
    PlantsMasterPage,
  ]
})
export class PlantsMasterPageModule {}
