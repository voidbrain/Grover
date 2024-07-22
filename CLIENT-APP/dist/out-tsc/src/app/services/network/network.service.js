import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { Platform } from '@ionic/angular';
import { ToastService } from '../toast/toast.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
export var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus[ConnectionStatus["Offline"] = 0] = "Offline";
    ConnectionStatus[ConnectionStatus["Online"] = 1] = "Online";
})(ConnectionStatus || (ConnectionStatus = {}));
var NetworkService = /** @class */ (function () {
    function NetworkService(network, plt, toastService) {
        var _this = this;
        this.network = network;
        this.plt = plt;
        this.toastService = toastService;
        this.plt.ready().then(function () {
            _this.status = new BehaviorSubject([]);
            _this.initializeNetworkEvents();
        });
    }
    NetworkService.prototype.watchOnline = function () {
        return this.network.onConnect();
    };
    NetworkService.prototype.watchOffline = function () {
        return this.network.onDisconnect();
    };
    NetworkService.prototype.initializeNetworkEvents = function () {
        var _this = this;
        if (this.plt.is('desktop')) {
            this.updateNetworkStatus(navigator.onLine ? ConnectionStatus.Online : ConnectionStatus.Offline);
            var el_1 = this;
            window.addEventListener('online', function () { el_1.updateNetworkStatus(ConnectionStatus.Online); });
            window.addEventListener('offline', function () { el_1.updateNetworkStatus(ConnectionStatus.Offline); });
        }
        else {
            console.info('[NETWORK]: native');
            this.updateNetworkStatus(this.network.type ? ConnectionStatus.Online : ConnectionStatus.Offline);
            this.network.onConnect().subscribe(function () { _this.updateNetworkStatus(ConnectionStatus.Online); });
            this.network.onDisconnect().subscribe(function () { _this.updateNetworkStatus(ConnectionStatus.Offline); });
        }
    };
    NetworkService.prototype.updateNetworkStatus = function (status) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.toastService.pushMessage('Network status: ' + (status ? 'Online' : 'Offline'));
                this.toastService.presentToast();
                this.status.next(status);
                return [2 /*return*/];
            });
        });
    };
    NetworkService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [Network,
            Platform,
            ToastService])
    ], NetworkService);
    return NetworkService;
}());
export { NetworkService };
//# sourceMappingURL=network.service.js.map