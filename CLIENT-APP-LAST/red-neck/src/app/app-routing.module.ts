/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/authentication/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'pages/home', pathMatch: 'full' },
  { path: 'pages/home', loadChildren: () => import('./pages/home/home.page.module').then( m => m.HomePageModule) },

  { path: 'pages/login', loadChildren: () => import('./pages/user/public/login/login.module').then( m => m.LoginPageModule) },
  { path: 'pages/register', loadChildren: () => import('./pages/user/public/register/register.module').then( m => m.RegisterPageModule) },
  { path: 'pages/members', canActivate: [AuthGuardService], loadChildren: () => import('./pages/user/member/member-routing.module').then( m => m.MemberRoutingModule) },

  { path: 'pages/plants', loadChildren: () => import('./pages/plants/master/master.page.module').then( m => m.PlantsMasterPageModule) },
  { path: 'pages/plants/create', loadChildren: () => import('./pages/plants/detail/detail.page.module').then( m => m.PlantsDetailPageModule) },
  { path: 'pages/plants/edit/:id', loadChildren: () => import('./pages/plants/detail/detail.page.module').then( m => m.PlantsDetailPageModule) },

  { path: 'pages/strains', loadChildren: () => import('./pages/strains/master/master.page.module').then( m => m.StrainsMasterPageModule) },
  { path: 'pages/strains/create', loadChildren: () => import('./pages/strains/detail/detail.page.module').then( m => m.StrainsDetailPageModule) },
  { path: 'pages/strains/edit/:id', loadChildren: () => import('./pages/strains/detail/detail.page.module').then( m => m.StrainsDetailPageModule) },

  { path: 'pages/doses', loadChildren: () => import('./pages/doses/master/master.page.module').then( m => m.DosesMasterPageModule) },
  { path: 'pages/doses/create', loadChildren: () => import('./pages/doses/detail/detail.page.module').then( m => m.DosesDetailPageModule) },
  { path: 'pages/doses/edit/:id', loadChildren: () => import('./pages/doses/detail/detail.page.module').then( m => m.DosesDetailPageModule) },

  { path: 'pages/companies', loadChildren: () => import('./pages/companies/master/master.page.module').then( m => m.CompaniesMasterPageModule) },
  { path: 'pages/companies/create', loadChildren: () => import('./pages/companies/detail/detail.page.module').then( m => m.CompaniesDetailPageModule) },
  { path: 'pages/companies/edit/:id', loadChildren: () => import('./pages/companies/detail/detail.page.module').then( m => m.CompaniesDetailPageModule) },

  { path: 'pages/calendar', loadChildren: () => import('./pages/calendar/master/master.page.module').then( m => m.CalendarsMasterPageModule) },
  { path: 'pages/calendar/create', loadChildren: () => import('./pages/calendar/detail/detail.page.module').then( m => m.CalendarsDetailPageModule) },
  { path: 'pages/calendar/edit/:id', loadChildren: () => import('./pages/calendar/detail/detail.page.module').then( m => m.CalendarsDetailPageModule) },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
