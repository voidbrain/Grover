import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DosesDetailPage } from './detail.page';

const routes: Routes = [
  {
    path: '',
    component: DosesDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DosesDetailPageRoutingModule {}
