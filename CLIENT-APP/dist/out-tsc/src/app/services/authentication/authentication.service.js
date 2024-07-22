import * as tslib_1 from "tslib";
import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '../settings/settings.service';
var TOKEN_KEY = 'auth-token';
var AuthenticationService = /** @class */ (function () {
    function AuthenticationService(plt, appSettings) {
        var _this = this;
        this.plt = plt;
        this.appSettings = appSettings;
        this.authenticationState = new BehaviorSubject(false);
        this.plt.ready().then(function () {
            _this.checkToken();
        });
    }
    AuthenticationService.prototype.checkToken = function () {
        var res = localStorage.getItem(this.appSettings.appName + '_' + TOKEN_KEY);
        if (res) {
            this.authenticationState.next(true);
        }
    };
    AuthenticationService.prototype.login = function () {
        localStorage.setItem(this.appSettings.appName + '_' + TOKEN_KEY, 'Bearer 1234567');
        return this.authenticationState.next(true);
    };
    AuthenticationService.prototype.logout = function () {
        localStorage.removeItem(this.appSettings.appName + '_' + TOKEN_KEY);
        return this.authenticationState.next(false);
    };
    AuthenticationService.prototype.isAuthenticated = function () {
        return this.authenticationState.value;
    };
    AuthenticationService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [Platform,
            SettingsService])
    ], AuthenticationService);
    return AuthenticationService;
}());
export { AuthenticationService };
//# sourceMappingURL=authentication.service.js.map