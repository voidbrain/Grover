import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './services/authentication/auth-guard.service';

const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },


    { path: 'login', loadChildren: './pages/user/public/login/login.module#LoginPageModule' },
    { path: 'register', loadChildren: './pages/user/public/register/register.module#RegisterPageModule' },
    {
      path: 'members', 
      canActivate: [AuthGuardService],
      loadChildren: './pages/user/member/member-routing.module#MemberRoutingModule'
    },

    { path: 'plants', loadChildren: './pages/plants/master/master.module#MasterPageModule' },
    { path: 'plants/create', loadChildren: './pages/plants/detail/detail.module#DetailPageModule' },
    { path: 'plants/edit/:id', loadChildren: './pages/plants/detail/detail.module#DetailPageModule' },

    { path: 'doses', loadChildren: './pages/doses/master/master.module#MasterPageModule' },
    { path: 'doses/create', loadChildren: './pages/doses/detail/detail.module#DetailPageModule' },
    { path: 'doses/edit/:id', loadChildren: './pages/doses/detail/detail.module#DetailPageModule' },

    { path: 'calendars', loadChildren: './pages/calendars/master/master.module#MasterPageModule' },
    { path: 'calendars/create', loadChildren: './pages/calendars/detail/detail.module#DetailPageModule' },
    { path: 'calendars/edit/:id', loadChildren: './pages/calendars/detail/detail.module#DetailPageModule' },

    { path: 'strains', loadChildren: './pages/strains/master/master.module#MasterPageModule' },
    { path: 'strains/create', loadChildren: './pages/strains/detail/detail.module#DetailPageModule' },
    { path: 'strains/edit/:id', loadChildren: './pages/strains/detail/detail.module#DetailPageModule' },

    { path: 'companies', loadChildren: './pages/companies/master/master.module#MasterPageModule' },
    { path: 'companies/create', loadChildren: './pages/companies/detail/detail.module#DetailPageModule' },
    { path: 'companies/edit/:id', loadChildren: './pages/companies/detail/detail.module#DetailPageModule' },

    { path: 'settings', loadChildren: './pages/settings/detail/detail.module#DetailPageModule' },

    { path: 'report', loadChildren: './pages/report/detail/detail.module#DetailPageModule' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
