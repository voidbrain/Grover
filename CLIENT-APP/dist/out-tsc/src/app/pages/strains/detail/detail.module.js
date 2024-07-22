import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../../pipes/pipes.module';
import { DetailPage } from './detail.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../../components/components.module';
var routes = [{ path: '', component: DetailPage }];
var DetailPageModule = /** @class */ (function () {
    function DetailPageModule() {
    }
    DetailPageModule = tslib_1.__decorate([
        NgModule({
            imports: [
                CommonModule,
                IonicModule,
                RouterModule.forChild(routes),
                PipesModule,
                FormsModule,
                ReactiveFormsModule,
                TranslateModule.forChild(),
                ComponentsModule
            ],
            declarations: [DetailPage]
        })
    ], DetailPageModule);
    return DetailPageModule;
}());
export { DetailPageModule };
//# sourceMappingURL=detail.module.js.map