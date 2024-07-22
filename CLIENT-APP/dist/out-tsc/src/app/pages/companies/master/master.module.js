import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MasterPage } from './master.page';
var routes = [
    {
        path: '',
        component: MasterPage
    }
];
var MasterPageModule = /** @class */ (function () {
    function MasterPageModule() {
    }
    MasterPageModule = tslib_1.__decorate([
        NgModule({
            imports: [
                CommonModule,
                FormsModule,
                IonicModule,
                RouterModule.forChild(routes)
            ],
            declarations: [MasterPage]
        })
    ], MasterPageModule);
    return MasterPageModule;
}());
export { MasterPageModule };
//# sourceMappingURL=master.module.js.map