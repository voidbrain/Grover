import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
var ToastService = /** @class */ (function () {
    function ToastService(plt, toastCtrl) {
        this.plt = plt;
        this.toastCtrl = toastCtrl;
        this.toastMsgs = [];
        this.plt.ready().then(function () { });
    }
    ToastService.prototype.presentToast = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var toast;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toastCtrl.create({
                            message: this.toastMsgs.toString().split(",").join("\n"),
                            duration: 3000,
                            position: 'top',
                            cssClass: 'globe'
                        })];
                    case 1:
                        toast = _a.sent();
                        toast.present();
                        toast.onDidDismiss().then(function () {
                            _this.toastMsgs = [];
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ToastService.prototype.pushMessage = function (message) {
        this.toastMsgs.push(message);
    };
    ToastService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [Platform,
            ToastController])
    ], ToastService);
    return ToastService;
}());
export { ToastService };
//# sourceMappingURL=toast.service.js.map