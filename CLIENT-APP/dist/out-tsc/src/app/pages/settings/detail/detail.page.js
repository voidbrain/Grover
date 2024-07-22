import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
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
        this.page = 'settings';
        this.isOnline = false;
        this.isReadyToSave = false;
        this.showForm = true;
        this.form = formBuilder.group({
            date_time: ['', Validators.required],
            deleted: [''],
            enabled: [''],
            id: [''],
            lastUpdate: [''],
            night_mode_off: ['', Validators.required],
            night_mode_on: ['', Validators.required],
            pin_ec_gnd: ['', Validators.required],
            pin_ec_vcc: ['', Validators.required],
            pin_ph_gnd: ['', Validators.required],
            pin_ph_vcc: ['', Validators.required],
            pin_t_gnd: ['', Validators.required],
            pin_t_vcc: ['', Validators.required],
            store_data: ['', Validators.required],
            work_mode: ['', Validators.required],
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
            _this.getItem(1);
        }).catch(function (err) { return console.error(err); });
    };
    DetailPage.prototype.goBack = function () {
        this.router.navigate([this.page]);
    };
    DetailPage.prototype.getItem = function (id) {
        var _this = this;
        // var companiesP = this.db.getItems('companies');
        // var strainsP = this.db.getItems('strains');
        // var g_scenariosP = this.db.getItems('growingscenarios');
        // var g_mediumP = this.db.getItems('growingmediums');
        // Promise.all([companiesP, strainsP, g_scenariosP, g_mediumP]).then(([companies, strains, g_scenarios, g_mediums]) => { 
        // 	this.companies = companies;
        // 	this.strains = strains; 
        // 	this.g_scenarios = g_scenarios; 
        // 	this.g_mediums = g_mediums;
        if (id) {
            this.db.getItem(this.page, id).then(function (item) {
                _this.form.patchValue(item, { emitEvent: true });
            });
        }
        //});
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
    DetailPage.prototype.saveForm = function () {
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
