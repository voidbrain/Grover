import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ColorPickerPopoverPage } from './color-picker-popover.page';
var routes = [
    {
        path: '',
        component: ColorPickerPopoverPage
    }
];
var ColorPickerPopoverPageModule = /** @class */ (function () {
    function ColorPickerPopoverPageModule() {
    }
    ColorPickerPopoverPageModule = tslib_1.__decorate([
        NgModule({
            imports: [
                CommonModule,
                FormsModule,
                IonicModule,
                RouterModule.forChild(routes),
            ],
            declarations: [ColorPickerPopoverPage]
        })
    ], ColorPickerPopoverPageModule);
    return ColorPickerPopoverPageModule;
}());
export { ColorPickerPopoverPageModule };
//# sourceMappingURL=color-picker-popover.module.js.map