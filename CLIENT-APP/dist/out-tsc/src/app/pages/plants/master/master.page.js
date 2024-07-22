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
        this.table = 'plants';
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
        var itemsP = this.db.getItems(this.table);
        var calendarsP = this.db.getItems('calendars');
        var dosesP = this.db.getItems('doses');
        var strainsP = this.db.getItems('strains');
        Promise.all([itemsP, calendarsP, dosesP, strainsP]).then(function (_a) {
            var items = _a[0], calendars = _a[1], doses = _a[2], strains = _a[3];
            items.sort(function (a, b) {
                var compare = (a.day_harvest != 0 && b.day_harvest != 0 ? 'day_harvest' :
                    (a.day_start_bloom != 0 && b.day_start_bloom != 0 ? 'day_start_bloom' :
                        (a.day_start_grow != 0 && b.day_start_grow != 0 ? 'day_start_grow' : 'id')));
                (a[compare] > b[compare] ? 1 : (b[compare] > a[compare] ? -1 : 0));
            });
            items.map(function (item) {
                item.strain = strains.find(function (el) { return el.id == item.id_strain; });
                console.log(item);
                item.chartConfig = {
                    id: 'chart',
                    type: 'doughnut',
                    data: {
                        labels: ["Sativa", "Indica"],
                        datasets: [{
                                data: [item.strain.percent_sativa, (100 - item.strain.percent_sativa)],
                                backgroundColor: [
                                    'rgba(17, 176, 50, 1)',
                                    'rgba(125, 17, 176, 1)'
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
                    showValue: false
                };
                var timeDiff = Math.abs(Date.now() - new Date((item.day_start_grow ? item.day_start_grow : Date.now())).getTime());
                item.weeks_n = Math.floor(Math.abs(timeDiff) / (1000 * 7 * 24 * 60 * 60));
                for (var _i = 0, calendars_1 = calendars; _i < calendars_1.length; _i++) {
                    var phase = calendars_1[_i];
                    if (item.weeks_n < phase.duration) {
                        item.phase = phase;
                        break;
                    }
                }
                ;
                var dose = (item.phase ? item.phase : calendars[calendars.length - 1]);
                item.dose = doses.find(function (singleDose) { singleDose.id == dose.id_dose; });
                //item.phase.days = timeDiff - (item.weeks_n / (1000 * 7 * 24 * 60 * 60));
                //let phase_days = item.phase.week_n;
                var item_days = Math.floor(Math.abs(timeDiff) / (7 * 24 * 60 * 60));
                ;
                //console.log(phase_days,item_days)
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