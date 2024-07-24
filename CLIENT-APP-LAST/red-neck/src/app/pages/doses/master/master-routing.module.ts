import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DosesMasterPage } from './master.page';

const routes: Routes = [
  {
    path: '',
    component: DosesMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DosesMasterPageRoutingModule {}
