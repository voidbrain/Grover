import { Component }             from '@angular/core';
import { Platform }              from '@ionic/angular';
import { SplashScreen }          from '@ionic-native/splash-screen/ngx';
import { StatusBar }             from '@ionic-native/status-bar/ngx';

import { Router }                from '@angular/router';
import { AuthenticationService } from './services/authentication/authentication.service';

import { TranslateService }      from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    public appPages = [
        { title: 'home',       url: '/home',         icon: 'home' },
        { title: 'plants',     url: '/plants',       icon: 'flower' },
        { title: 'strains',    url: '/strains',      icon: 'leaf' },
        { title: 'companies',  url: '/companies',    icon: 'business' },
        { title: 'calendars',  url: '/calendars',    icon: 'calendar' },
        { title: 'doses',      url: '/doses',        icon: 'flask' },
        { title: 'settings',   url: '/settings',     icon: 'settings' },
        { title: 'report',        url: '/report',          icon: 'clipboard' }
    ];

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,

        private authenticationService: AuthenticationService,
        private router: Router,

        private translate: TranslateService
    ) {
        this.translate.addLangs(['en', 'it', 'ru', 'jp', , 'de']);
        this.translate.setDefaultLang('en');
        const browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|it|jp|de|ru/) ? browserLang : 'en');

        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            console.info('[APP]: Ready');

            // AUTHENTICATION LOGIN 
            // this.authenticationService.authenticationState.subscribe(state => {
            //     if (state) {
            //         this.router.navigate(['members', 'dashboard']);
            //     } else {
            //         this.router.navigate(['login']);
            //     }
            // });


        });
    }
}
