import * as tslib_1 from "tslib";
import { Component, ViewChildren } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/chart/chart.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenu, IonMenuToggle, IonRefresher, IonRefresherContent, IonReorder, IonReorderGroup, IonRow, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
var RegisterPage = /** @class */ (function () {
    function RegisterPage() {
    }
    RegisterPage.prototype.ngOnInit = function () {
    };
    RegisterPage = tslib_1.__decorate([
        Component({
            selector: 'app-register',
            templateUrl: './register.page.html',
            styleUrls: ['./register.page.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [])
    ], RegisterPage);
    return RegisterPage;
}());
export { RegisterPage };
//# sourceMappingURL=register.page.js.map
