import * as tslib_1 from "tslib";
import { AuthenticationService } from './../../../../services/authentication/authentication.service';
import { Component } from '@angular/core';
var DashboardPage = /** @class */ (function () {
    function DashboardPage(authService) {
        this.authService = authService;
    }
    DashboardPage.prototype.ngOnInit = function () {
    };
    DashboardPage.prototype.logout = function () {
        this.authService.logout();
    };
    DashboardPage = tslib_1.__decorate([
        Component({
            selector: 'app-dashboard',
            templateUrl: './dashboard.page.html',
            styleUrls: ['./dashboard.page.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [AuthenticationService])
    ], DashboardPage);
    return DashboardPage;
}());
export { DashboardPage };
//# sourceMappingURL=dashboard.page.js.map