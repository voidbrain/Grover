import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarsDetailPage } from './detail.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarsDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarsDetailPageRoutingModule {}
