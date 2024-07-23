import * as tslib_1 from "tslib";
import { Component, ViewChildren } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/chart/chart.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenu, IonMenuToggle, IonRefresher, IonRefresherContent, IonReorder, IonReorderGroup, IonRow, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
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
        this.page = 'strains';
        this.isOnline = false;
        this.isReadyToSave = false;
        this.showForm = true;
        this.form = formBuilder.group({
            name: ['', Validators.required],
            lineage: ['', Validators.required],
            percent_sativa: ['', Validators.required],
            id: ['',],
            enabled: ['',],
            deleted: ['',],
            lastUpdate: ['',],
        }, {});
        this.isOnline = navigator.onLine;
        this.form.valueChanges.subscribe(function (v) {
            _this.isReadyToSave = _this.isOnline && _this.form.valid;
        });
        this.item = { chartConfig: {} };
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
        var strainsP = this.db.getItems('strains');
        Promise.all([strainsP]).then(function (_a) {
            var strains = _a[0];
            _this.strains = strains;
            if (id) {
                _this.db.getItem(_this.page, id).then(function (item) {
                    item.lineage = item.lineage.split(',');
                    _this.form.patchValue(item, { emitEvent: true });
                    console.log(_this.form);
                    item.chartConfig = {
                        id: 'chart',
                        type: 'doughnut',
                        data: {
                            labels: ["Sativa", "Indica"],
                            datasets: [{
                                    data: [item.percent_sativa, (100 - item.percent_sativa)],
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
                    _this.item = item;
                });
            }
        });
    };
    DetailPage.prototype.addConnectivityListeners = function () {
        var _this = this;
        this.network.watchOnline().subscribe(function () {
            console.log("online");
            _this.isOnline = true;
            _this.isReadyToSave = _this.form.valid;
        });
        this.network.watchOffline().subscribe(function () {
            console.log("offline");
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
