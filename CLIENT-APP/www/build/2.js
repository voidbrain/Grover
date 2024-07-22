webpackJsonp([2],{

/***/ 473:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PlantsModule", function() { return PlantsModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ngx_translate_core__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__pipes_pipes_module__ = __webpack_require__(359);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__plants__ = __webpack_require__(477);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





//import { ProgressBarComponent } from '../../components/progress-bar/progress-bar';
var PlantsModule = (function () {
    function PlantsModule() {
    }
    PlantsModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["NgModule"])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_4__plants__["a" /* PlantsPage */],
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["f" /* IonicPageModule */].forChild(__WEBPACK_IMPORTED_MODULE_4__plants__["a" /* PlantsPage */]),
                __WEBPACK_IMPORTED_MODULE_1__ngx_translate_core__["b" /* TranslateModule */].forChild(),
                __WEBPACK_IMPORTED_MODULE_3__pipes_pipes_module__["a" /* PipesModule */]
            ],
            exports: [
                __WEBPACK_IMPORTED_MODULE_4__plants__["a" /* PlantsPage */],
            ]
        })
    ], PlantsModule);
    return PlantsModule;
}());

//# sourceMappingURL=plants.module.js.map

/***/ }),

/***/ 477:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PlantsPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__ = __webpack_require__(358);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_providers__ = __webpack_require__(357);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_moment__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_moment__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_moment_locale_it__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_moment_locale_it___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_moment_locale_it__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var PlantsPage = (function () {
    function PlantsPage(dbProvider, modalCtrl, loadingCtrl, navCtrl, actionSheetCtrl) {
        this.dbProvider = dbProvider;
        this.modalCtrl = modalCtrl;
        this.loadingCtrl = loadingCtrl;
        this.navCtrl = navCtrl;
        this.actionSheetCtrl = actionSheetCtrl;
        this.plants = [];
        this.isItemShown = function (item) {
            return this.shownItem === item;
        };
    }
    PlantsPage.prototype.ngOnInit = function () {
        var _this = this;
        this.today = new Date().getTime() / 1000;
        this.dbProvider.initProvider().then(function () {
            _this.filterPlantsPage(true).then(function () { });
        });
    };
    PlantsPage.prototype.info = function (strain) {
        console.log(strain);
    };
    PlantsPage.prototype.openItem = function (item) {
        this.navCtrl.push('PlantsDetailPage', { item: item });
    };
    PlantsPage.prototype.editItem = function (item) {
        //this.navCtrl.push('PlantsDetailPage', { item: item });
        console.log("ciao", item);
    };
    PlantsPage.prototype.deleteItem = function (item) {
        //this.navCtrl.push('PlantsDetailPage', { item: item });
        console.log(item);
    };
    PlantsPage.prototype.doRefresh = function (refresher) {
        var _this = this;
        this.dbProvider.initProvider().then(function () {
            _this.filterPlantsPage(true).then(function () { return refresher.complete(); });
        });
    };
    // getPath(tasks, actualTask, daysum) {
    //     //console.log(tasks, actualTask, daysum)
    //     if(!actualTask["day"] ) {
    //         daysum += " "+actualTask["time_gap"] ;
    //         let row = tasks.filter(function( obj ) {
    //             return obj.id == actualTask["id_rif_task"]
    //         });
    //         console.log(tasks, row, daysum)
    //         return this.getPath(tasks, row, daysum);
    //     }else{
    //         return actualTask[0]["day"] + daysum;
    //     } 
    // }
    PlantsPage.prototype.getFullInfo = function (plant) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                __WEBPACK_IMPORTED_MODULE_4_moment___default.a.locale('it');
                return [2 /*return*/, new Promise(function (resolve) {
                        var previous_task_done = 0;
                        var _loop_1 = function (el) {
                            var row = plant.man_tasks[el];
                            if (row["day"]) {
                                if (row["mandatory"]) {
                                    previous_task_done = 1;
                                    plant["calendar_macrotask_image"] = row["icon"];
                                    plant["calendar_macrotask_date"] = row["day"];
                                }
                                plant["tasks_time"] = __WEBPACK_IMPORTED_MODULE_4_moment___default()(__WEBPACK_IMPORTED_MODULE_4_moment___default.a.unix(row["day"])).unix();
                            }
                            else {
                                var parent_1 = plant.man_tasks.filter(function (obj) { return obj.id == row["id_rif_task"]; });
                                var estimatedDateSum = row["time_gap"].split(" ");
                                row["estimated_day"] = __WEBPACK_IMPORTED_MODULE_4_moment___default.a.unix((parent_1[0]["day"] ? parent_1[0]["day"] : parent_1[0]["estimated_day"])).add(parseInt(estimatedDateSum[0]), estimatedDateSum[1]).unix();
                                if (_this.today > row["estimated_day"]) {
                                    //console.log(plant["id"])
                                    plant["tasks_class"] = "danger";
                                    plant["tasks_alert"] = row["name"];
                                    plant["tasks_icon"] = row["icon"];
                                    plant["tasks_time"] = row["estimated_day"];
                                }
                                else {
                                    if (_this.today > __WEBPACK_IMPORTED_MODULE_4_moment___default.a.unix(row["estimated_day"]).subtract(2, "weeks").unix()) {
                                        //console.log(plant["id"])
                                        plant["tasks_class"] = "secondary";
                                        plant["tasks_alert"] = row["name"];
                                        plant["tasks_icon"] = row["icon"];
                                        plant["tasks_time"] = row["estimated_day"];
                                        previous_task_done = 1;
                                        console.log(plant["id"], plant["tasks_alert"], plant["tasks_class"], plant["tasks_time"]);
                                    }
                                }
                            }
                        };
                        for (var el in plant.man_tasks) {
                            _loop_1(el);
                        }
                        _this.dbProvider.filterStrains(plant["id_strain"]).then(function (strain) {
                            plant["strain"] = strain;
                            _this.dbProvider.filterCompanies(plant["id_company"]).then(function (company) {
                                plant["company"] = company;
                                resolve();
                            });
                        });
                    })];
            });
        });
    };
    PlantsPage.prototype.toggleItem = function (item) {
        if (this.isItemShown(item)) {
            this.shownItem = null;
        }
        else {
            this.shownItem = item;
        }
    };
    ;
    PlantsPage.prototype.filterPlantsPage = function (hideLoading) {
        if (hideLoading === void 0) { hideLoading = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var loading, start, plants, promises, el, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loading = null;
                        if (!hideLoading) {
                            loading = this.loadingCtrl.create({
                                content: 'Please wait...'
                            });
                            loading.present();
                        }
                        start = performance.now();
                        return [4 /*yield*/, this.dbProvider.filterPlants()];
                    case 1:
                        plants = _a.sent();
                        promises = [];
                        for (el in plants) {
                            row = plants[el];
                            promises.push(this.getFullInfo(row));
                        }
                        Promise.all(promises).then(function () {
                            console.log(plants);
                            _this.plants = plants;
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    PlantsPage.prototype.identify = function (index, item) {
        return item.id;
    };
    PlantsPage.prototype.presentActionSheet = function () {
        var actionSheet = this.actionSheetCtrl.create({
            title: 'Add New',
            buttons: [
                {
                    text: 'Plant',
                    //role: 'destructive',
                    handler: function () {
                        console.log('Destructive clicked');
                    }
                }, {
                    text: 'Strain',
                    handler: function () {
                        console.log('Archive clicked');
                    }
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: function () {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    };
    PlantsPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'page-plants',template:/*ion-inline-start:"/Users/voidbrain/ionic/apps/grover/src/pages/plants/plants.html"*/'<ion-header>\n    <ion-navbar>\n        <ion-title>\n            Plants\n        </ion-title>\n        <ion-buttons end>\n            <button ion-button icon-only (click)="presentFilterPage($event)">\n                <ion-icon name="options"></ion-icon>\n            </button>\n        </ion-buttons>\n    </ion-navbar>\n</ion-header>\n\n<ion-content>\n    <ion-refresher (ionRefresh)="doRefresh($event)">\n        <ion-refresher-content\n            pullingIcon="arrow-dropdown"\n            pullingText="Pull to refresh"\n            refreshingSpinner="circles"\n            refreshingText="Refreshing...">\n        </ion-refresher-content>\n    </ion-refresher>\n\n    <ion-list [hidden]="plants.length == 0" [approxItemHeight]=" \'140px\' " [virtualScroll]="plants" [virtualTrackBy]="identify">\n        <ion-item-sliding *virtualItem="let plant">\n            <div ion-item class="item item-text-wrap">\n                <ion-grid>\n                    <ion-row>\n                        <ion-col col-9>\n                            <h2>{{ plant.strain.name }} </h2>\n                        </ion-col>\n                        <ion-col col-3 text-right class="percent"> \n                            <span>{{ plant.strain.percent_sativa >= 50 ? plant.strain.percent_sativa : 100-plant.strain.percent_sativa }}% {{ plant.strain.percent_sativa >= 50 ? "Sativa" : "Indica" }}</span>\n                            <ion-img width="14" height="14" src="assets/icons/sativa.png" [hidden]=" plant.strain.percent_sativa < 66 "></ion-img><ion-img width="14" height="14" src="assets/icons/ibrida.png" [hidden]=" (plant.strain.percent_sativa >= 66 || plant.strain.percent_sativa < 33) "></ion-img><ion-img width="14" height="14" src="assets/icons/indica.png" [hidden]=" plant.strain.percent_sativa >= 33 "></ion-img>\n                        </ion-col>\n                    </ion-row>\n                    <ion-row>\n                        <ion-col col-3 (click)="toggleItem(plant)" class="item-expand-footer">\n                            <div *ngIf="!plant.man_tasks[(plant.man_tasks).length-1].day">\n                                <ion-img width="14" height="14" src="assets/icons/{{ plant.calendar_macrotask_image }}.png" ></ion-img>\n                                {{ plant.calendar_macrotask_date | countTimeFromDatePipe:\'days\' }} D\n                            </div>\n                            <div *ngIf="plant.man_tasks[(plant.man_tasks).length-1].day">\n                                <ion-icon class="danger" name="clock"></ion-icon>\n                                {{ plant.man_tasks[(plant.man_tasks).length-1].day - plant.man_tasks[0].day | countTimeFromDatePipe:\'weeks\' }} W Tot\n                            </div>\n                        </ion-col>\n                        <ion-col col-7 class="{{ plant.tasks_class }}">\n                            <ion-img width="14" height="14" src="assets/icons/{{ plant.tasks_icon }}.png" ></ion-img> \n                            {{ plant.tasks_alert }} <small>( {{ plant.tasks_time | countTimeFromDatePipe:\'weeks\' | convertToSentence }} )</small>\n                        </ion-col>\n                        <ion-col col-2 text-right *ngIf="plant.grams"> \n                            <h2><ion-img width="14" height="14" src="assets/icons/grams.png" ></ion-img>{{ plant.grams }}</h2>\n                        </ion-col>\n                        <ion-col col-2 text-right *ngIf="!plant.grams"> \n                            <ion-img width="14" height="14" src="assets/icons/qr-code.png" ></ion-img> 2\n                        </ion-col>\n                    </ion-row>\n                    <ion-row>\n                        <ion-col col-12>\n                           \n                            <small><ion-icon name="calendar"></ion-icon> {{ plant.man_tasks[0].day | formatDatePipe:\'DD MMM YY\' }} / <i [class]="(plant.man_tasks[(plant.man_tasks).length-1].day ? \'\':\'estimated\')">{{ (plant.man_tasks[(plant.man_tasks).length-1].day ? plant.man_tasks[(plant.man_tasks).length-1].day : plant.man_tasks[(plant.man_tasks).length-1].estimated_day ) | formatDatePipe:\'DD MMM YY\' }}</i></small>\n                        </ion-col>\n                    </ion-row>\n                    <ion-row>\n                        <ion-col col-12 [class]="isItemShown(plant) ? \'item-expand active\' : \'item-expand inactive\'"> \n                            <div>\n                                <!-- <ul class="progress-indicator">\n                                    <li class="completed"> <span class="bubble"></span> Step 1. </li>\n                                    <li class="completed"> <span class="bubble"></span> Step 2. </li>\n                                    <li> <span class="bubble"></span> Step 3. </li>\n                                    <li> <span class="bubble"></span> Step 4. </li>\n                                    <li> <span class="bubble"></span> Step 5. </li>\n                                </ul> -->\n                                <ul class="progress-indicator">\n                                    <li *ngFor="let task of plant.man_tasks" [class]="(task.day?\'completed\':\'\')"><span [class]="(task.mandatory ? \'mandatory bubble\' : \'bubble\')"></span> {{task.name}}</li>\n                                </ul>\n                            </div>\n                        </ion-col>\n                    </ion-row>    \n                </ion-grid>\n            </div>\n            <ion-item-options side="right">\n                <button ion-button color="primary" (click)="editItem(plant)">\n                    <ion-icon name="edit"></ion-icon>\n                    Edit\n                </button>\n                <button ion-button color="danger" (click)="deleteItem(plant)">\n                    <ion-icon name="delete"></ion-icon>\n                    Delete\n                </button>\n            </ion-item-options>\n        </ion-item-sliding>\n        <!-- <button ion-button color="primary" (click)="presentActionSheet()">\n        <ion-icon name="add"></ion-icon>\n            Add\n        </button> -->\n    </ion-list>\n    \n</ion-content>\n'/*ion-inline-end:"/Users/voidbrain/ionic/apps/grover/src/pages/plants/plants.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_3__providers_providers__["a" /* DbProvider */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* ModalController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* LoadingController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* NavController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* ActionSheetController */]])
    ], PlantsPage);
    return PlantsPage;
}());

//# sourceMappingURL=plants.js.map

/***/ })

});
//# sourceMappingURL=2.js.map