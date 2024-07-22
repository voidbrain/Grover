import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NetworkService } from '../network/network.service';
import { SettingsService } from '../settings/settings.service';
var ApiService = /** @class */ (function () {
    function ApiService(http, networkService, appSettings) {
        this.http = http;
        this.networkService = networkService;
        this.appSettings = appSettings;
        this.url = '';
    }
    ApiService.prototype.init = function () {
        this.url = this.appSettings.serverAddress + '/' + this.appSettings.purposes[this.appSettings.purpose] + '/';
    };
    ApiService.prototype.get = function (table, params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        _this.http.get(_this.url + table, { params: params }).toPromise().then(function (response) {
                            resolve(response);
                        });
                    })];
            });
        });
    };
    ApiService.prototype.post = function (table, items, params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        if (_this.networkService.status) {
                            console.info('[API]: network available');
                            params.items = items;
                            _this.http.post(_this.url + table, params).subscribe(function (response) {
                                resolve(response);
                            });
                        }
                        else {
                            console.warn('[API]: not available');
                            items.map(function (item) { item.synced = 0; });
                            var response = { items: items };
                            resolve(response);
                        }
                    })];
            });
        });
    };
    ApiService.prototype.delete = function (table, item) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        if (_this.networkService.status) {
                            console.info('[API]: network available');
                            _this.http.delete(_this.url + table + '?id=' + item.id).subscribe(function (response) {
                                console.info('[API]: item deleted online: ', item);
                                resolve(item);
                            });
                        }
                        else {
                            console.warn('[API]: network not available');
                            item.deleted = 1;
                            item.synced = 0;
                            console.info('[API]: item deleted offline: ', item);
                            resolve(item);
                        }
                    })];
            });
        });
    };
    ApiService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [HttpClient,
            NetworkService,
            SettingsService])
    ], ApiService);
    return ApiService;
}());
export { ApiService };
//# sourceMappingURL=api.service.js.map