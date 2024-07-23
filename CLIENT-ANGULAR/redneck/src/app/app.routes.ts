import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { PlantsMasterComponent } from './pages/plants/master/master.component';
import { PlantsDetailComponent } from './pages/plants/detail/detail.component';
import { CompaniesMasterComponent } from './pages/companies/master/master.component';
import { CompaniesDetailComponent } from './pages/companies/detail/detail.component';
import { DosesMasterComponent } from './pages/doses/master/master.component';
import { DosesDetailComponent } from './pages/doses/detail/detail.component';
import { StrainsMasterComponent } from './pages/strains/master/master.component';
import { StrainsDetailComponent } from './pages/strains/detail/detail.component';
import { CalendarsMasterComponent } from './pages/calendars/master/master.component';
import { CalendarsDetailComponent } from './pages/calendars/detail/detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  { path: 'doses', component: DosesMasterComponent },
  { path: 'doses/create', component: DosesDetailComponent },
  { path: 'doses/edit/:id', component: DosesDetailComponent },

  { path: 'calendars', component: CalendarsMasterComponent },
  { path: 'calendars/create', component: CalendarsDetailComponent },
  { path: 'calendars/edit/:id', component: CalendarsDetailComponent },

  { path: 'strains', component: StrainsMasterComponent },
  { path: 'strains/create', component: StrainsDetailComponent },
  { path: 'strains/edit/:id', component: StrainsDetailComponent },

  { path: 'plants', component: PlantsMasterComponent },
  { path: 'plants/create', component: PlantsDetailComponent },
  { path: 'plants/edit/:id', component: PlantsDetailComponent },

  { path: 'companies', component: CompaniesMasterComponent },
  { path: 'companies/create', component: CompaniesDetailComponent },
  { path: 'companies/edit/:id', component: CompaniesDetailComponent },

  // { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
  // { path: 'login', loadChildren: './pages/user/public/login/login.module#LoginPageModule' },
  // { path: 'register', loadChildren: './pages/user/public/register/register.module#RegisterPageModule' },
  // {
  //     path: 'members',
  //     canActivate: [AuthGuardService],
  //     loadChildren: './pages/user/member/member-routing.module#MemberRoutingModule'
  // },
  // { path: 'settings', loadChildren: './pages/settings/detail/detail.module#DetailPageModule' }
];
