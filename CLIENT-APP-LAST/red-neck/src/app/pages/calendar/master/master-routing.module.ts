import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarsMasterPage } from './master.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarsMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarsMasterPageRoutingModule {}
