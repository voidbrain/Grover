import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StrainsDetailPage } from './detail.page';

const routes: Routes = [
  {
    path: '',
    component: StrainsDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StrainsDetailPageRoutingModule {}
