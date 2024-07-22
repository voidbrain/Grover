import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { DbService } from '../../services/db/db.service';
import { TranslateService } from '@ngx-translate/core';
var HomePage = /** @class */ (function () {
    function HomePage(db, translateService) {
        this.db = db;
        this.translateService = translateService;
        this.language = this.translateService.currentLang;
        this.someProperty = '';
    }
    HomePage.prototype.ngOnInit = function () { };
    HomePage.prototype.ionViewWillEnter = function () {
        this.db.load()
            .then(function (result) {
        }).catch(function (err) { return console.error(err); });
    };
    HomePage.prototype.languageChange = function () {
        this.translateService.use(this.language);
    };
    HomePage = tslib_1.__decorate([
        Component({
            selector: 'app-home',
            templateUrl: 'home.page.html',
            styleUrls: ['home.page.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [DbService,
            TranslateService])
    ], HomePage);
    return HomePage;
}());
export { HomePage };
//# sourceMappingURL=home.page.js.map