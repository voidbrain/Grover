import * as tslib_1 from "tslib";
import { Component, ViewChildren } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { NetworkService } from '../../../services/network/network.service';
import { FormBuilder, Validators } from '@angular/forms';
var DetailPage = /** @class */ (function () {
    function DetailPage(db, network, loadingController, route, router, formBuilder) {
        var _this = this;
        this.db = db;
        this.network = network;
        this.loadingController = loadingController;
        this.route = route;
        this.router = router;
        this.formBuilder = formBuilder;
        this.page = 'calendars';
        this.table = 'doses';
        this.isOnline = false;
        this.isReadyToSave = false;
        this.showForm = true;
        this.um = 5;
        this.form = formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            id: [''],
            enabled: [''],
            deleted: [''],
            lastUpdate: [''],
        }, {});
        this.isOnline = navigator.onLine;
        this.form.valueChanges.subscribe(function (v) {
            _this.isReadyToSave = _this.isOnline && _this.form.valid;
        });
    }
    DetailPage.prototype.ngOnInit = function () { };
    DetailPage.prototype.ionViewWillEnter = function () {
        var _this = this;
        this.db.load().then(function () {
            var id = _this.route.snapshot.paramMap.get('id');
            _this.getItem(parseInt(id));
        }).catch(function (err) { return console.error(err); });
    };
    DetailPage.prototype.goBack = function () {
        this.router.navigate([this.page]);
    };
    DetailPage.prototype.getItem = function (id) {
        var _this = this;
        this.id_rif = id;
        if (id) {
            // 
            var itemP = this.db.getItem(this.page, id);
            var dosesP = this.db.getItems('doses');
            Promise.all([itemP, dosesP]).then(function (_a) {
                var item = _a[0], doses = _a[1];
                _this.form.patchValue(item, { emitEvent: true });
                item.phases = JSON.parse(item.phases);
                item.phases.forEach(function (phase) {
                    var dose = doses.find(function (el) { return el.id == phase.id; });
                    if (dose) {
                        phase.name = dose.name;
                        phase.chartConfig = {
                            id: 'chart',
                            type: 'bar',
                            data: {
                                labels: ['Gro', 'Micro', 'Bloom', 'Ripen', 'EC'],
                                datasets: [{
                                        data: [dose.gro, dose.micro, dose.bloom, dose.ripen, dose.EC],
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
                    }
                });
                _this.phases = item.phases;
            });
        }
    };
    DetailPage.prototype.addConnectivityListeners = function () {
        var _this = this;
        this.network.watchOnline().subscribe(function () {
            console.info('online');
            _this.isOnline = true;
            _this.isReadyToSave = _this.form.valid;
        });
        this.network.watchOffline().subscribe(function () {
            console.info('offline');
            _this.isOnline = false;
            _this.isReadyToSave = false;
        });
    };
    DetailPage.prototype.saveForm = function (value) {
        var _this = this;
        var saveItem = Array();
        saveItem.push(this.form.value);
        this.db.putItems(this.page, saveItem).then(function (result) {
            _this.router.navigate([_this.page]);
        });
    };
    DetailPage.prototype.getConnectedPhases = function () {
        var _this = this;
        var column = 'enabled, deleted, id_calendar';
        var forceLoading = true;
        this.db.getConnectedItems(this.table, column, this.id_rif).then(function (items) {
            items.sort(function (a, b) { return (a.pos > b.pos) ? 1 : ((b.pos > a.pos) ? -1 : 0); });
            items.forEach(function (item, i) {
                item.chartConfig = {
                    id: 'chart',
                    type: 'bar',
                    data: {
                        labels: ['Gro', 'Micro', 'Bloom', 'Ripen', 'EC'],
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
            _this.phases = items;
        });
    };
    DetailPage.prototype.updateList = function (items) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.db.putItems(_this.table, items).then(function () {
                resolve();
            });
        });
    };
    DetailPage.prototype.deleteItem = function (item) {
        var filtered = this.phases.filter(function (el) {
            return el.id != item.id;
        });
        this.updateList(filtered);
    };
    DetailPage.prototype.showDetail = function (item) {
        this.slidingItem._results.map(function (el) { el.closeOpened(); });
        this.router.navigate([this.table + '/edit', JSON.stringify(item.id)]);
    };
    DetailPage.prototype.doRefresh = function (refresher) {
        var _this = this;
        this.slidingItem._results.map(function (el) { el.closeOpened(); });
        var forceLoading = true;
        this.db.initService(forceLoading)
            .then(function () {
            _this.getConnectedPhases();
            refresher.target.complete();
        })
            .catch(function (err) { return console.error(err); });
    };
    DetailPage.prototype.reorder = function (event) {
        var draggedItem = this.phases.splice(event.detail.from, 1)[0];
        this.phases.splice(event.detail.to, 0, draggedItem);
        var update = [this.phases[event.detail.to], this.phases[event.detail.from]];
        update.forEach(function (el, index) {
            el.pos = index;
            el.lastUpdate = Date.now();
        });
        this.updateList(update).then(function () {
            event.detail.complete();
        });
    };
    tslib_1.__decorate([
        ViewChildren('slidingItem'),
        tslib_1.__metadata("design:type", Object)
    ], DetailPage.prototype, "slidingItem", void 0);
    DetailPage = tslib_1.__decorate([
        Component({
            selector: 'app-detail',
            templateUrl: './detail.page.html',
            styleUrls: ['./detail.page.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [DbService,
            NetworkService,
            LoadingController,
            ActivatedRoute,
            Router,
            FormBuilder])
    ], DetailPage);
    return DetailPage;
}());
export { DetailPage };
//# sourceMappingURL=detail.page.js.map
