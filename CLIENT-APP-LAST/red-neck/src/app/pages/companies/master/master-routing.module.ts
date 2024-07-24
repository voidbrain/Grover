import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompaniesMasterPage } from './master.page';

const routes: Routes = [
  {
    path: '',
    component: CompaniesMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompaniesMasterPageRoutingModule {}
