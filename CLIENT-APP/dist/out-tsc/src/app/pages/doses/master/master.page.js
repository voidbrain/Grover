import * as tslib_1 from "tslib";
import { Component, ViewChildren } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
var MasterPage = /** @class */ (function () {
    function MasterPage(db, loadingController, router) {
        this.db = db;
        this.loadingController = loadingController;
        this.router = router;
        this.math = Math;
        this.table = 'doses';
    }
    MasterPage.prototype.ngOnInit = function () { };
    MasterPage.prototype.ionViewWillEnter = function () {
        var _this = this;
        console.info('[PAGE]: Start');
        this.db.load().then(function () {
            var forceLoading = true;
            _this.db.initService(forceLoading).then(function () {
                _this.getItems();
            });
        }).catch(function (err) { return console.error(err); });
    };
    MasterPage.prototype.getItems = function () {
        var _this = this;
        this.db.getItems(this.table).then(function (items) {
            var colors = [
                'rgba(17, 176, 50, 1)',
                'rgba(125, 17, 176, 1)',
                'rgba(176, 17, 17, 1)',
                'rgba(240, 215, 7, 1)',
                'rgba(7, 18, 240, 1)'
            ];
            items.map(function (item, i) {
                item.chartConfig = {
                    id: 'chart',
                    type: 'bar',
                    data: {
                        labels: ["Gro", "Micro", "Bloom", "Ripen", "EC"],
                        datasets: [{
                                data: [item.gro, item.micro, item.bloom, item.ripen, item.EC],
                                backgroundColor: [
                                    'rgba(17, 176, 50, 1)',
                                    'rgba(125, 17, 176, 1)',
                                    'rgba(176, 17, 17, 1)',
                                    'rgba(240, 215, 7, 1)',
                                    'rgba(7, 18, 240, 1)'
                                ],
                                borderWidth: 1
                            }]
                    },
                    x: {
                        stacked: false,
                        show: false,
                    },
                    y: {
                        stacked: false,
                        show: false,
                    },
                    labelsFontSize: 9,
                    showValue: true
                };
            });
            _this.items = items;
            console.info('[PAGE]: Ready');
        });
    };
    MasterPage.prototype.deleteItem = function (item) {
        var _this = this;
        this.slidingItem._results.map(function (el) { el.closeOpened(); });
        this.db.deleteItem(this.table, item).then(function (result) {
            _this.getItems();
        });
    };
    MasterPage.prototype.showDetail = function (item) {
        this.slidingItem._results.map(function (el) { el.closeOpened(); });
        this.router.navigate([this.table + '/edit', JSON.stringify(item.id)]);
    };
    MasterPage.prototype.doRefresh = function (refresher) {
        var _this = this;
        this.slidingItem._results.map(function (el) { el.closeOpened(); });
        var forceLoading = true;
        this.db.initService(forceLoading)
            .then(function () {
            _this.getItems();
            refresher.target.complete();
        })
            .catch(function (err) { return console.error(err); });
    };
    tslib_1.__decorate([
        ViewChildren('slidingItem'),
        tslib_1.__metadata("design:type", Object)
    ], MasterPage.prototype, "slidingItem", void 0);
    MasterPage = tslib_1.__decorate([
        Component({
            selector: 'app-master',
            templateUrl: './master.page.html',
            styleUrls: ['./master.page.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [DbService,
            LoadingController,
            Router])
    ], MasterPage);
    return MasterPage;
}());
export { MasterPage };
//# sourceMappingURL=master.page.js.map