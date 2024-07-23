import * as tslib_1 from "tslib";
import { Component, ViewChildren } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/chart/chart.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenu, IonMenuToggle, IonRefresher, IonRefresherContent, IonReorder, IonReorderGroup, IonRow, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { LoadingController, PopoverController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { NetworkService } from '../../../services/network/network.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ColorService } from '../../../services/color/color-service';
import { ColorPickerPopoverPage } from '../../../components/color-popover/color-picker-popover.page';
var DetailPage = /** @class */ (function () {
    function DetailPage(db, network, loadingController, route, router, formBuilder, popoverController, col) {
        var _this = this;
        this.db = db;
        this.network = network;
        this.loadingController = loadingController;
        this.route = route;
        this.router = router;
        this.formBuilder = formBuilder;
        this.popoverController = popoverController;
        this.col = col;
        this.page = 'doses';
        this.isOnline = false;
        this.isReadyToSave = false;
        this.showForm = true;
        this.form = formBuilder.group({
            name: ['', Validators.required],
            gro: ['', Validators.required],
            micro: ['', Validators.required],
            bloom: ['', Validators.required],
            ripen: ['', Validators.required],
            EC: ['', Validators.required],
            id: [''],
            enabled: [''],
            deleted: [''],
            color: [''],
            lastUpdate: [''],
        }, {});
        this.chart = { chartConfig: {} };
        this.color = { key: '', value: '', friendlyName: '' };
        this.isOnline = navigator.onLine;
        this.form.valueChanges.subscribe(function (v) {
            _this.isReadyToSave = _this.isOnline && _this.form.valid;
        });
    }
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
        var calendarsP = this.db.getItems('calendars');
        Promise.all([calendarsP]).then(function (_a) {
            var calendars = _a[0];
            _this.calendars = calendars;
            if (id) {
                _this.db.getItem(_this.page, id).then(function (item) {
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
                            show: true,
                        },
                        y: {
                            stacked: false,
                            show: false,
                        },
                        labelsFontSize: 9,
                        showValue: true
                    };
                    _this.form.patchValue(item, { emitEvent: true });
                    _this.color = _this.col.colorList.find(function (el) { return el.value == item.color; });
                    console.log(_this.col.colorList, _this.color, item);
                    _this.chart = item;
                });
            }
        });
    };
    DetailPage.prototype.addConnectivityListeners = function () {
        var _this = this;
        this.network.watchOnline().subscribe(function () {
            console.log('online');
            _this.isOnline = true;
            _this.isReadyToSave = _this.form.valid;
        });
        this.network.watchOffline().subscribe(function () {
            console.log('offline');
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
    DetailPage.prototype.pickColor = function (ev) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var popover;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.popoverController.create({
                            component: ColorPickerPopoverPage,
                            event: ev,
                            componentProps: {
                                color: this.color
                            }
                        })];
                    case 1:
                        popover = _a.sent();
                        popover.onDidDismiss()
                            .then(function (data) {
                            var x = data['data']; // Here's returned value from popover
                            _this.color = x || _this.color;
                            _this.form.controls['color'].setValue(_this.color.value);
                        });
                        return [4 /*yield*/, popover.present()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
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
            FormBuilder,
            PopoverController,
            ColorService])
    ], DetailPage);
    return DetailPage;
}());
export { DetailPage };
//# sourceMappingURL=detail.page.js.map
