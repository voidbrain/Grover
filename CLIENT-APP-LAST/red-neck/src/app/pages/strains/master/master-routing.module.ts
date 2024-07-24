import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StrainsMasterPage } from './master.page';

const routes: Routes = [
  {
    path: '',
    component: StrainsMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StrainsMasterPageRoutingModule {}
