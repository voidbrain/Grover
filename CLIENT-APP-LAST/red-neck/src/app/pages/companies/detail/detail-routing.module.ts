import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompaniesDetailPage } from './detail.page';

const routes: Routes = [
  {
    path: '',
    component: CompaniesDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompaniesDetailPageRoutingModule {}
