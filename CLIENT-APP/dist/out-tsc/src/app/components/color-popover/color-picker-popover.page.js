import * as tslib_1 from "tslib";
import { Component, ViewChild } from '@angular/core';
import { IonList, NavParams, PopoverController } from '@ionic/angular';
import { ColorService } from '../../services/color/color-service';
var ColorPickerPopoverPage = /** @class */ (function () {
    function ColorPickerPopoverPage(colorService, navParams, popCtrl) {
        this.colorService = colorService;
        this.navParams = navParams;
        this.popCtrl = popCtrl;
    }
    ColorPickerPopoverPage.prototype.ngOnInit = function () {
        this.currentColor = this.navParams.get('color');
    };
    ColorPickerPopoverPage.prototype.closePopover = function () {
        var _this = this;
        this.popCtrl.getTop().then(function (p) { return p.dismiss(_this.currentColor); });
    };
    ColorPickerPopoverPage.prototype.selectColor = function (idx) {
        this.currentColor = this.colorService.colorList[idx];
        this.closePopover();
        // console.log(`Selected: ${idx} from ColorPickerPopoverPage`)
    };
    tslib_1.__decorate([
        ViewChild(IonList),
        tslib_1.__metadata("design:type", IonList)
    ], ColorPickerPopoverPage.prototype, "list", void 0);
    ColorPickerPopoverPage = tslib_1.__decorate([
        Component({
            selector: 'app-color-picker-popover',
            templateUrl: './color-picker-popover.page.html',
            styleUrls: ['./color-picker-popover.page.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [ColorService,
            NavParams,
            PopoverController])
    ], ColorPickerPopoverPage);
    return ColorPickerPopoverPage;
}());
export { ColorPickerPopoverPage };
//# sourceMappingURL=color-picker-popover.page.js.map