import * as tslib_1 from "tslib";
import { Component, ViewChildren } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/chart/chart.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenu, IonMenuToggle, IonRefresher, IonRefresherContent, IonReorder, IonReorderGroup, IonRow, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
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
