import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './sanitize-html-pipe/sanitize-html-pipe.pipe';
var PipesModule = /** @class */ (function () {
    function PipesModule() {
    }
    PipesModule = tslib_1.__decorate([
        NgModule({
            imports: [
    RouterLink, RouterOutlet, FormsModule, ReactiveFormsModule, ChartComponent,
    IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenu, IonMenuToggle, IonRefresher, IonRefresherContent, IonReorder, IonReorderGroup, IonRow, IonSelectOption, IonTitle, IonToolbar
  ],
            declarations: [
                SanitizeHtmlPipe
            ],
            exports: [
                SanitizeHtmlPipe
            ]
        })
    ], PipesModule);
    return PipesModule;
}());
export { PipesModule };
//# sourceMappingURL=pipes.module.js.map
