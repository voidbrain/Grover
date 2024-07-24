import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlantsMasterPage } from './master.page';

const routes: Routes = [
  {
    path: '',
    component: PlantsMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlantsMasterPageRoutingModule {}
