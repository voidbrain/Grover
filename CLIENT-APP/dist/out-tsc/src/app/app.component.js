import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication/authentication.service';
import { TranslateService } from '@ngx-translate/core';
var AppComponent = /** @class */ (function () {
    function AppComponent(platform, splashScreen, statusBar, authenticationService, router, translate) {
        var _this = this;
        this.platform = platform;
        this.splashScreen = splashScreen;
        this.statusBar = statusBar;
        this.authenticationService = authenticationService;
        this.router = router;
        this.translate = translate;
        this.appPages = [
            { title: 'home', url: '/home', icon: 'home' },
            { title: 'plants', url: '/plants', icon: 'flower' },
            { title: 'strains', url: '/strains', icon: 'leaf' },
            { title: 'companies', url: '/companies', icon: 'business' },
            { title: 'calendars', url: '/calendars', icon: 'calendar' },
            { title: 'doses', url: '/doses', icon: 'flask' },
            { title: 'settings', url: '/settings', icon: 'settings' }
        ];
        this.translate.addLangs(['en', 'it', 'ru', 'jp', , 'de']);
        this.translate.setDefaultLang('en');
        var browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|it|jp|de|ru/) ? browserLang : 'en');
        this.platform.ready().then(function () {
            _this.statusBar.styleDefault();
            _this.splashScreen.hide();
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
    AppComponent = tslib_1.__decorate([
        Component({
            selector: 'app-root',
            templateUrl: 'app.component.html'
        }),
        tslib_1.__metadata("design:paramtypes", [Platform,
            SplashScreen,
            StatusBar,
            AuthenticationService,
            Router,
            TranslateService])
    ], AppComponent);
    return AppComponent;
}());
export { AppComponent };
//# sourceMappingURL=app.component.js.map