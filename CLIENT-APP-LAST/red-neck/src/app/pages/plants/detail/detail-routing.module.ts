import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlantsDetailPage } from './detail.page';

const routes: Routes = [
  {
    path: '',
    component: PlantsDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlantsDetailPageRoutingModule {}
