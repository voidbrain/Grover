import * as tslib_1 from "tslib";
import { AuthenticationService } from './../../../../services/authentication/authentication.service';
import { Component } from '@angular/core';
var LoginPage = /** @class */ (function () {
    function LoginPage(authService) {
        this.authService = authService;
    }
    LoginPage.prototype.ngOnInit = function () {
    };
    LoginPage.prototype.login = function () {
        this.authService.login();
    };
    LoginPage = tslib_1.__decorate([
        Component({
            selector: 'app-login',
            templateUrl: './login.page.html',
            styleUrls: ['./login.page.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [AuthenticationService])
    ], LoginPage);
    return LoginPage;
}());
export { LoginPage };
//# sourceMappingURL=login.page.js.map