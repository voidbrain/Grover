webpackJsonp([4],{

/***/ 133:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 133;

/***/ }),

/***/ 185:
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"../pages/plants-detail/plants-detail.module": [
		472,
		3
	],
	"../pages/plants/plants.module": [
		473,
		2
	],
	"../pages/tutorial/tutorial.module": [
		474,
		1
	],
	"../pages/welcome/welcome.module": [
		475,
		0
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids)
		return Promise.reject(new Error("Cannot find module '" + req + "'."));
	return __webpack_require__.e(ids[1]).then(function() {
		return __webpack_require__(ids[0]);
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = 185;
module.exports = webpackAsyncContext;

/***/ }),

/***/ 357:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__db__ = __webpack_require__(442);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__db__["a"]; });


//# sourceMappingURL=providers.js.map

/***/ }),

/***/ 359:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PipesModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__formatdate_pipe__ = __webpack_require__(443);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__counttimefromdate_pipe__ = __webpack_require__(446);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__addtodate_pipe__ = __webpack_require__(447);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__converttosentence_pipe__ = __webpack_require__(448);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var PipesModule = (function () {
    function PipesModule() {
    }
    PipesModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["NgModule"])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_1__formatdate_pipe__["a" /* formatDatePipe */],
                __WEBPACK_IMPORTED_MODULE_2__counttimefromdate_pipe__["a" /* countTimeFromDatePipe */],
                __WEBPACK_IMPORTED_MODULE_3__addtodate_pipe__["a" /* addToDatePipe */],
                __WEBPACK_IMPORTED_MODULE_4__converttosentence_pipe__["a" /* convertToSentence */]
            ],
            imports: [],
            exports: [
                __WEBPACK_IMPORTED_MODULE_1__formatdate_pipe__["a" /* formatDatePipe */],
                __WEBPACK_IMPORTED_MODULE_2__counttimefromdate_pipe__["a" /* countTimeFromDatePipe */],
                __WEBPACK_IMPORTED_MODULE_3__addtodate_pipe__["a" /* addToDatePipe */],
                __WEBPACK_IMPORTED_MODULE_4__converttosentence_pipe__["a" /* convertToSentence */]
            ],
            providers: []
        })
    ], PipesModule);
    return PipesModule;
}());

//# sourceMappingURL=pipes.module.js.map

/***/ }),

/***/ 360:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(361);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(373);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 373:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export createTranslateLoader */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common_http__ = __webpack_require__(134);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_device__ = __webpack_require__(135);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_app_version__ = __webpack_require__(137);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_in_app_browser__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_platform_browser__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_splash_screen__ = __webpack_require__(138);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__ionic_native_status_bar__ = __webpack_require__(139);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__ionic_storage__ = __webpack_require__(387);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__ngx_translate_core__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__ngx_translate_http_loader__ = __webpack_require__(418);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11_ionic_angular__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_angular2_moment__ = __webpack_require__(466);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_angular2_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12_angular2_moment__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__providers_providers__ = __webpack_require__(357);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__ionic_native_local_notifications__ = __webpack_require__(468);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__ionic_native_network__ = __webpack_require__(356);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__pipes_pipes_module__ = __webpack_require__(359);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__providers_connectivity__ = __webpack_require__(470);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__app_component__ = __webpack_require__(471);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


















//import { ProgressBarComponent } from '../components/progress-bar/progress-bar';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
function createTranslateLoader(http) {
    return new __WEBPACK_IMPORTED_MODULE_10__ngx_translate_http_loader__["a" /* TranslateHttpLoader */](http, './assets/i18n/', '.json');
}
// export function provideSettings(storage: Storage) {
//   *
//    * The Settings provider takes a set of default settings for your app.
//    *
//    * You can add new settings options at any time. Once the settings are saved,
//    * these values will not overwrite the saved values (this can be done manually if desired).
//   return new Settings(storage, { option1: 0 });
// }
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["NgModule"])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_18__app_component__["a" /* MyApp */]
                //DetailComponent,
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_5__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_16__pipes_pipes_module__["a" /* PipesModule */],
                __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["b" /* HttpClientModule */],
                __WEBPACK_IMPORTED_MODULE_9__ngx_translate_core__["b" /* TranslateModule */].forRoot({
                    loader: {
                        provide: __WEBPACK_IMPORTED_MODULE_9__ngx_translate_core__["a" /* TranslateLoader */],
                        useFactory: (createTranslateLoader),
                        deps: [__WEBPACK_IMPORTED_MODULE_0__angular_common_http__["a" /* HttpClient */]]
                    }
                }),
                __WEBPACK_IMPORTED_MODULE_11_ionic_angular__["e" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_18__app_component__["a" /* MyApp */], {}, {
                    links: [
                        { loadChildren: '../pages/plants-detail/plants-detail.module#PlantsDetailPageModule', name: 'PlantsDetailPage', segment: 'plants-detail', priority: 'low', defaultHistory: [] },
                        { loadChildren: '../pages/plants/plants.module#PlantsModule', name: 'PlantsPage', segment: 'plants', priority: 'low', defaultHistory: [] },
                        { loadChildren: '../pages/tutorial/tutorial.module#TutorialPageModule', name: 'TutorialPage', segment: 'tutorial', priority: 'low', defaultHistory: [] },
                        { loadChildren: '../pages/welcome/welcome.module#WelcomePageModule', name: 'WelcomePage', segment: 'welcome', priority: 'low', defaultHistory: [] }
                    ]
                }),
                __WEBPACK_IMPORTED_MODULE_12_angular2_moment__["MomentModule"],
                __WEBPACK_IMPORTED_MODULE_8__ionic_storage__["a" /* IonicStorageModule */].forRoot()
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_11_ionic_angular__["c" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_18__app_component__["a" /* MyApp */],
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_13__providers_providers__["a" /* DbProvider */],
                __WEBPACK_IMPORTED_MODULE_2__ionic_native_device__["a" /* Device */],
                __WEBPACK_IMPORTED_MODULE_3__ionic_native_app_version__["a" /* AppVersion */],
                __WEBPACK_IMPORTED_MODULE_4__ionic_native_in_app_browser__["a" /* InAppBrowser */],
                __WEBPACK_IMPORTED_MODULE_6__ionic_native_splash_screen__["a" /* SplashScreen */],
                __WEBPACK_IMPORTED_MODULE_7__ionic_native_status_bar__["a" /* StatusBar */],
                __WEBPACK_IMPORTED_MODULE_14__ionic_native_local_notifications__["a" /* LocalNotifications */],
                __WEBPACK_IMPORTED_MODULE_15__ionic_native_network__["a" /* Network */],
                __WEBPACK_IMPORTED_MODULE_17__providers_connectivity__["a" /* Connectivity */],
                //{ provide: Settings, useFactory: provideSettings, deps: [Storage] },
                // Keep this to enable Ionic's runtime error handling during development
                { provide: __WEBPACK_IMPORTED_MODULE_1__angular_core__["ErrorHandler"], useClass: __WEBPACK_IMPORTED_MODULE_11_ionic_angular__["d" /* IonicErrorHandler */] }
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 442:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DbProvider; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__(134);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_device__ = __webpack_require__(135);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_app_version__ = __webpack_require__(137);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var DbProvider = (function () {
    function DbProvider(http, appVersion, device, platform) {
        this.http = http;
        this.appVersion = appVersion;
        this.device = device;
        this.platform = platform;
    }
    DbProvider.prototype.initProvider = function () {
        var _this = this;
        var promise = this.initDb();
        if (1) {
            // if (!navigator.onLine) {
            return promise;
        }
        var server_url = (!this.platform.is('cordova') ? "/api" : "http://voidbrain.net/grover/ajax/moduli/api");
        var lastUpdate = [];
        lastUpdate["companies"] = localStorage.getItem('companies');
        lastUpdate["mediums"] = localStorage.getItem('mediums');
        lastUpdate["plants"] = localStorage.getItem('plants');
        lastUpdate["scenarios"] = localStorage.getItem('scenarios');
        lastUpdate["calendarmantasks"] = localStorage.getItem('calendarmantasks');
        lastUpdate["strains"] = localStorage.getItem('strains');
        promise = promise
            .then(function () { return _this.loadData(server_url + '/' + 'companies', lastUpdate["companies"], 'companies'); })
            .then(function () { return _this.loadData(server_url + '/' + 'mediums', lastUpdate["mediums"], 'mediums'); })
            .then(function () { return _this.loadData(server_url + '/' + 'plants', lastUpdate["plants"], 'plants'); })
            .then(function () { return _this.loadData(server_url + '/' + 'scenarios', lastUpdate["scenarios"], 'scenarios'); })
            .then(function () { return _this.loadData(server_url + '/' + 'strains', lastUpdate["strains"], 'strains'); });
        return promise;
    };
    DbProvider.prototype.initDb = function () {
        var _this = this;
        if (this.db) {
            this.db.close();
        }
        return new Promise(function (resolve) {
            var openRequest = indexedDB.open("GROVER");
            openRequest.onupgradeneeded = function (event) {
                var target = event.target;
                var db = target.result;
                console.log(db.version);
                //if(!db.version||db.version==0){
                var storeCompanies = db.createObjectStore('companies', { keyPath: 'id' });
                var storeMediums = db.createObjectStore('mediums', { keyPath: 'id' });
                var storePlants = db.createObjectStore('plants', { keyPath: 'id' });
                var storeScenarios = db.createObjectStore('scenarios', { keyPath: 'id' });
                //const storeCalendarmantasks    = db.createObjectStore('calendarmantasks', {keyPath: 'id'});
                var storeStrains = db.createObjectStore('strains', { keyPath: 'id' });
                storeCompanies.createIndex('id', 'id');
                //storeCompanies.createIndex('name', 'name');
                storeMediums.createIndex('id', 'id');
                //storeMediums.createIndex('name', 'name');
                storePlants.createIndex('day_start_grow', 'day_start_grow');
                // storePlants.createIndex('day_start_bloom', 'day_start_bloom');
                // storePlants.createIndex('day_harvest', 'day_harvest');
                //storePlants.createIndex('man_tasks', 'man_tasks[0].day', {unique:false});
                storeScenarios.createIndex('id', 'id');
                //storeScenarios.createIndex('name', 'name');
                //storeCalendarmantasks.createIndex('id', 'id');
                storeStrains.createIndex('id', 'id');
                //}
            };
            openRequest.onsuccess = function (event) {
                _this.db = event.target.result;
                _this.db.onerror = function (event) {
                    console.log(event);
                };
                resolve();
            };
        });
    };
    DbProvider.prototype.loadData = function (dataUrl, lastUpdate, objectStore) {
        var _this = this;
        return new Promise(function (resolve) {
            var params = new __WEBPACK_IMPORTED_MODULE_1__angular_common_http__["c" /* HttpParams */]();
            params = params.append("db_version", String(_this.db.version));
            params = params.append("last_update", lastUpdate);
            if (_this.platform.is('cordova')) {
                var appName;
                var packageName;
                var versionCode;
                var versionNumber;
                _this.appVersion.getAppName().then(function (s) { appName = s; });
                _this.appVersion.getPackageName().then(function (s) { packageName = s; });
                _this.appVersion.getVersionCode().then(function (s) { versionCode = s; });
                _this.appVersion.getVersionNumber().then(function (s) { versionNumber = s; });
                params = params.append("app_name", appName);
                params = params.append("package_name", packageName);
                params = params.append("version_code", versionCode);
                params = params.append("version_number", versionNumber);
                params = params.append("uuid", _this.device.uuid);
                params = params.append("model", _this.device.model);
                params = params.append("cordova", _this.device.cordova);
                params = params.append("platform", _this.device.platform);
                params = params.append("version", _this.device.version);
                params = params.append("manufacturer", _this.device.manufacturer);
                params = params.append("serial", _this.device.serial);
            }
            else {
                params = params.append("app_name", "GROVER");
                params = params.append("package_name", "");
                params = params.append("version_code", "");
                params = params.append("version_number", "");
                params = params.append("uuid", "dev-01");
                params = params.append("platform", "browser");
                params = params.append("model", "");
                params = params.append("cordova", "");
                params = params.append("version", "");
                params = params.append("manufacturer", "");
                params = params.append("serial", "");
            }
            var data = _this.http.get(dataUrl, { params: params }).subscribe(function (data) {
                var tx = _this.db.transaction(objectStore, 'readwrite');
                var store = tx.objectStore(objectStore);
                for (var el in data) {
                    var row = data[el];
                    if (row.id) {
                        switch (objectStore) {
                            case "companies":
                                store.put({
                                    name: row.name, abilitato: Number(row.abilitato), last_update: Number(row.last_update), cancellato: Number(row.cancellato), id: row.id
                                });
                                break;
                            case "mediums":
                                store.put({
                                    name: row.name, abilitato: Number(row.abilitato), last_update: Number(row.last_update), cancellato: Number(row.cancellato), id: row.id
                                });
                                break;
                            case "plants":
                                store.put({
                                    id_strain: Number(row.id_strain),
                                    id_company: Number(row.id_company),
                                    id_growing_scenario: Number(row.id_growing_scenario),
                                    id_growing_medium: Number(row.id_growing_medium),
                                    generation: Number(row.generation),
                                    day_start_grow: Number(row.day_start_grow),
                                    // day_start_bloom:          Number(row.day_start_bloom),        
                                    // day_harvest:              Number(row.day_harvest),  
                                    yeld: Number(row.yeld),
                                    man_tasks: row.man_tasks,
                                    notes: row.notes,
                                    abilitato: Number(row.abilitato),
                                    last_update: Number(row.last_update),
                                    cancellato: Number(row.cancellato),
                                    id: row.id
                                });
                                break;
                            case "scenarios":
                                store.put({
                                    name: row.name, abilitato: Number(row.abilitato), last_update: Number(row.last_update), cancellato: Number(row.cancellato), id: row.id
                                });
                                break;
                            case "strains":
                                store.put({
                                    name: row.name,
                                    lineage: row.lineage,
                                    percent_sativa: Number(row.percent_sativa),
                                    abilitato: Number(row.abilitato),
                                    last_update: Number(row.last_update),
                                    cancellato: Number(row.cancellato),
                                    id: row.id
                                });
                                break;
                            default:
                                break;
                        }
                    }
                }
                tx.oncomplete = function (e) {
                    localStorage.setItem(objectStore, Date.now().toString());
                    resolve();
                };
            });
        });
    };
    // filter(company=null): Promise<Company[]> {
    //     const tx = this.db.transaction('companies', 'readonly');
    //     const store = tx.objectStore('companies');
    //     const dataCompaniesIndex: any = store.index('name');
    //     let promise = new Promise<Company[]>(resolve => {
    //         if(company){
    //              dataCompaniesIndex.get(plant).onsuccess = e => resolve(e.target.result);
    //         }else{
    //             dataCompaniesIndex.getAll().onsuccess = e => resolve(e.target.result);     
    //         }
    //     });
    //     return promise; //.then(e => e.sort());
    // }
    DbProvider.prototype.filterCompanies = function (item, column) {
        if (item === void 0) { item = null; }
        if (column === void 0) { column = "id"; }
        var tx = this.db.transaction('companies', 'readonly');
        var store = tx.objectStore('companies');
        var dataIndex = store.index(column);
        var promise = new Promise(function (resolve) {
            if (item) {
                dataIndex.get(item).onsuccess = function (e) { return resolve(e.target.result); };
            }
            else {
                dataIndex.getAll().onsuccess = function (e) { return resolve(e.target.result); };
            }
        });
        return promise;
    };
    DbProvider.prototype.filterMediums = function (item, column) {
        if (item === void 0) { item = null; }
        if (column === void 0) { column = "id"; }
        var tx = this.db.transaction('mediums', 'readonly');
        var store = tx.objectStore('mediums');
        var dataIndex = store.index(column);
        var promise = new Promise(function (resolve) {
            if (item) {
                dataIndex.get(item).onsuccess = function (e) { return resolve(e.target.result); };
            }
            else {
                dataIndex.getAll().onsuccess = function (e) { return resolve(e.target.result); };
            }
        });
        return promise;
    };
    DbProvider.prototype.filterPlants = function (item, column) {
        if (item === void 0) { item = null; }
        if (column === void 0) { column = "id"; }
        var tx = this.db.transaction('plants', 'readonly');
        var store = tx.objectStore('plants');
        var dataIndex = store.index('day_start_grow');
        var promise = new Promise(function (resolve) {
            if (item) {
                dataIndex.get(item).onsuccess = function (e) { return resolve(e.target.result); };
            }
            else {
                dataIndex.getAll().onsuccess = function (e) { return resolve(e.target.result); };
            }
        });
        return promise.then(function (e) { return e.sort(function (a, b) { return b.day_start_grow - a.day_start_grow; }); });
        //return promise;
    };
    DbProvider.prototype.filterScenarios = function (item, column) {
        if (item === void 0) { item = null; }
        if (column === void 0) { column = "id"; }
        var tx = this.db.transaction('scenarios', 'readonly');
        var store = tx.objectStore('scenarios');
        var dataIndex = store.index(column);
        var promise = new Promise(function (resolve) {
            if (item) {
                dataIndex.get(item).onsuccess = function (e) { return resolve(e.target.result); };
            }
            else {
                dataIndex.getAll().onsuccess = function (e) { return resolve(e.target.result); };
            }
        });
        return promise;
    };
    // filterCalendarmantasks(item=null,column="id"): Promise<Calendarmantask[]> {
    //     const tx = this.db.transaction('calendarmantasks', 'readonly');
    //     const store = tx.objectStore('calendarmantasks');
    //     const dataIndex: any = store.index(column);
    //     let promise = new Promise<Calendarmantask[]>(resolve => {
    //         if(item){
    //              dataIndex.get(item).onsuccess = e => resolve(e.target.result);
    //         }else{
    //             dataIndex.getAll().onsuccess = e => resolve(e.target.result);     
    //         }
    //     });
    //     return promise;
    // }
    DbProvider.prototype.filterStrains = function (item, column) {
        if (item === void 0) { item = null; }
        if (column === void 0) { column = "id"; }
        var tx = this.db.transaction('strains', 'readonly');
        var store = tx.objectStore('strains');
        var dataIndex = store.index(column);
        var promise = new Promise(function (resolve) {
            if (item) {
                dataIndex.get(item).onsuccess = function (e) { return resolve(e.target.result); };
            }
            else {
                dataIndex.getAll().onsuccess = function (e) { return resolve(e.target.result); };
            }
        });
        return promise;
    };
    DbProvider = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_common_http__["a" /* HttpClient */],
            __WEBPACK_IMPORTED_MODULE_4__ionic_native_app_version__["a" /* AppVersion */],
            __WEBPACK_IMPORTED_MODULE_3__ionic_native_device__["a" /* Device */],
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["m" /* Platform */]])
    ], DbProvider);
    return DbProvider;
}());

//# sourceMappingURL=db.js.map

/***/ }),

/***/ 443:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return formatDatePipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_moment__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_moment_locale_it__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_moment_locale_it___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_moment_locale_it__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



/**
 * Generated class for the FormatDatePipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
var formatDatePipe = (function () {
    function formatDatePipe() {
    }
    // *
    // * Takes a date value and returns a pretty string from current time, 
    // * for instance: "four hours ago" or "in eleven minutes".
    formatDatePipe.prototype.transform = function (date, format) {
        __WEBPACK_IMPORTED_MODULE_1_moment___default.a.locale('it');
        return __WEBPACK_IMPORTED_MODULE_1_moment___default()(__WEBPACK_IMPORTED_MODULE_1_moment___default.a.unix(date)).format(format);
    };
    formatDatePipe = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({
            name: 'formatDatePipe',
        })
    ], formatDatePipe);
    return formatDatePipe;
}());

//# sourceMappingURL=formatdate.pipe.js.map

/***/ }),

/***/ 445:
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": 186,
	"./af.js": 186,
	"./ar": 187,
	"./ar-dz": 188,
	"./ar-dz.js": 188,
	"./ar-kw": 189,
	"./ar-kw.js": 189,
	"./ar-ly": 190,
	"./ar-ly.js": 190,
	"./ar-ma": 191,
	"./ar-ma.js": 191,
	"./ar-sa": 192,
	"./ar-sa.js": 192,
	"./ar-tn": 193,
	"./ar-tn.js": 193,
	"./ar.js": 187,
	"./az": 194,
	"./az.js": 194,
	"./be": 195,
	"./be.js": 195,
	"./bg": 196,
	"./bg.js": 196,
	"./bm": 197,
	"./bm.js": 197,
	"./bn": 198,
	"./bn.js": 198,
	"./bo": 199,
	"./bo.js": 199,
	"./br": 200,
	"./br.js": 200,
	"./bs": 201,
	"./bs.js": 201,
	"./ca": 202,
	"./ca.js": 202,
	"./cs": 203,
	"./cs.js": 203,
	"./cv": 204,
	"./cv.js": 204,
	"./cy": 205,
	"./cy.js": 205,
	"./da": 206,
	"./da.js": 206,
	"./de": 207,
	"./de-at": 208,
	"./de-at.js": 208,
	"./de-ch": 209,
	"./de-ch.js": 209,
	"./de.js": 207,
	"./dv": 210,
	"./dv.js": 210,
	"./el": 211,
	"./el.js": 211,
	"./en-au": 212,
	"./en-au.js": 212,
	"./en-ca": 213,
	"./en-ca.js": 213,
	"./en-gb": 214,
	"./en-gb.js": 214,
	"./en-ie": 215,
	"./en-ie.js": 215,
	"./en-nz": 216,
	"./en-nz.js": 216,
	"./eo": 217,
	"./eo.js": 217,
	"./es": 218,
	"./es-do": 219,
	"./es-do.js": 219,
	"./es-us": 220,
	"./es-us.js": 220,
	"./es.js": 218,
	"./et": 221,
	"./et.js": 221,
	"./eu": 222,
	"./eu.js": 222,
	"./fa": 223,
	"./fa.js": 223,
	"./fi": 224,
	"./fi.js": 224,
	"./fo": 225,
	"./fo.js": 225,
	"./fr": 226,
	"./fr-ca": 227,
	"./fr-ca.js": 227,
	"./fr-ch": 228,
	"./fr-ch.js": 228,
	"./fr.js": 226,
	"./fy": 229,
	"./fy.js": 229,
	"./gd": 230,
	"./gd.js": 230,
	"./gl": 231,
	"./gl.js": 231,
	"./gom-latn": 232,
	"./gom-latn.js": 232,
	"./gu": 233,
	"./gu.js": 233,
	"./he": 234,
	"./he.js": 234,
	"./hi": 235,
	"./hi.js": 235,
	"./hr": 236,
	"./hr.js": 236,
	"./hu": 237,
	"./hu.js": 237,
	"./hy-am": 238,
	"./hy-am.js": 238,
	"./id": 239,
	"./id.js": 239,
	"./is": 240,
	"./is.js": 240,
	"./it": 45,
	"./it.js": 45,
	"./ja": 241,
	"./ja.js": 241,
	"./jv": 242,
	"./jv.js": 242,
	"./ka": 243,
	"./ka.js": 243,
	"./kk": 244,
	"./kk.js": 244,
	"./km": 245,
	"./km.js": 245,
	"./kn": 246,
	"./kn.js": 246,
	"./ko": 247,
	"./ko.js": 247,
	"./ky": 248,
	"./ky.js": 248,
	"./lb": 249,
	"./lb.js": 249,
	"./lo": 250,
	"./lo.js": 250,
	"./lt": 251,
	"./lt.js": 251,
	"./lv": 252,
	"./lv.js": 252,
	"./me": 253,
	"./me.js": 253,
	"./mi": 254,
	"./mi.js": 254,
	"./mk": 255,
	"./mk.js": 255,
	"./ml": 256,
	"./ml.js": 256,
	"./mr": 257,
	"./mr.js": 257,
	"./ms": 258,
	"./ms-my": 259,
	"./ms-my.js": 259,
	"./ms.js": 258,
	"./mt": 260,
	"./mt.js": 260,
	"./my": 261,
	"./my.js": 261,
	"./nb": 262,
	"./nb.js": 262,
	"./ne": 263,
	"./ne.js": 263,
	"./nl": 264,
	"./nl-be": 265,
	"./nl-be.js": 265,
	"./nl.js": 264,
	"./nn": 266,
	"./nn.js": 266,
	"./pa-in": 267,
	"./pa-in.js": 267,
	"./pl": 268,
	"./pl.js": 268,
	"./pt": 269,
	"./pt-br": 270,
	"./pt-br.js": 270,
	"./pt.js": 269,
	"./ro": 271,
	"./ro.js": 271,
	"./ru": 272,
	"./ru.js": 272,
	"./sd": 273,
	"./sd.js": 273,
	"./se": 274,
	"./se.js": 274,
	"./si": 275,
	"./si.js": 275,
	"./sk": 276,
	"./sk.js": 276,
	"./sl": 277,
	"./sl.js": 277,
	"./sq": 278,
	"./sq.js": 278,
	"./sr": 279,
	"./sr-cyrl": 280,
	"./sr-cyrl.js": 280,
	"./sr.js": 279,
	"./ss": 281,
	"./ss.js": 281,
	"./sv": 282,
	"./sv.js": 282,
	"./sw": 283,
	"./sw.js": 283,
	"./ta": 284,
	"./ta.js": 284,
	"./te": 285,
	"./te.js": 285,
	"./tet": 286,
	"./tet.js": 286,
	"./th": 287,
	"./th.js": 287,
	"./tl-ph": 288,
	"./tl-ph.js": 288,
	"./tlh": 289,
	"./tlh.js": 289,
	"./tr": 290,
	"./tr.js": 290,
	"./tzl": 291,
	"./tzl.js": 291,
	"./tzm": 292,
	"./tzm-latn": 293,
	"./tzm-latn.js": 293,
	"./tzm.js": 292,
	"./uk": 294,
	"./uk.js": 294,
	"./ur": 295,
	"./ur.js": 295,
	"./uz": 296,
	"./uz-latn": 297,
	"./uz-latn.js": 297,
	"./uz.js": 296,
	"./vi": 298,
	"./vi.js": 298,
	"./x-pseudo": 299,
	"./x-pseudo.js": 299,
	"./yo": 300,
	"./yo.js": 300,
	"./zh-cn": 301,
	"./zh-cn.js": 301,
	"./zh-hk": 302,
	"./zh-hk.js": 302,
	"./zh-tw": 303,
	"./zh-tw.js": 303
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 445;

/***/ }),

/***/ 446:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return countTimeFromDatePipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_moment__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


/**
 * Generated class for the MomentjsPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
var countTimeFromDatePipe = (function () {
    function countTimeFromDatePipe() {
    }
    // *
    // * Takes a date value and returns a pretty string from current time, 
    // * for instance: "four hours ago" or "in eleven minutes".
    countTimeFromDatePipe.prototype.transform = function (value, unit) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var todaysDate = __WEBPACK_IMPORTED_MODULE_1_moment___default()(new Date());
        var oDate = __WEBPACK_IMPORTED_MODULE_1_moment___default.a.unix(parseInt(value));
        var diffDays = todaysDate.diff(oDate, unit);
        return diffDays;
        //return moment(value).fromNow();
        //return value.toLowerCase();
    };
    countTimeFromDatePipe = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({
            name: 'countTimeFromDatePipe',
        })
    ], countTimeFromDatePipe);
    return countTimeFromDatePipe;
}());

//# sourceMappingURL=counttimefromdate.pipe.js.map

/***/ }),

/***/ 447:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return addToDatePipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_moment__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


/**
 * Generated class for the MomentjsPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
var addToDatePipe = (function () {
    function addToDatePipe() {
    }
    // *
    // * Takes a date value and returns a pretty string from current time, 
    // * for instance: "four hours ago" or "in eleven minutes".
    addToDatePipe.prototype.transform = function (date, add_tot, add_unit) {
        var nd = __WEBPACK_IMPORTED_MODULE_1_moment___default.a.unix(parseInt(date)).add(add_tot, add_unit).unix();
        return nd;
    };
    addToDatePipe = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({
            name: 'addToDatePipe',
        })
    ], addToDatePipe);
    return addToDatePipe;
}());

//# sourceMappingURL=addtodate.pipe.js.map

/***/ }),

/***/ 448:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return convertToSentence; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment_locale_it__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment_locale_it___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_moment_locale_it__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


/**
 * Generated class for the FormatDatePipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
var convertToSentence = (function () {
    function convertToSentence() {
    }
    // *
    // * Takes a date value and returns a pretty string from current time, 
    // * for instance: "four hours ago" or "in eleven minutes".
    convertToSentence.prototype.transform = function (date, format) {
        //moment.locale('it');
        var text = "";
        if (date >= 2) {
            text = "" + Math.abs(date) + " weeks ago";
        }
        else if (0 < date && date < 2) {
            text = "1 week ago";
        }
        else if (date == 0) {
            text = "This week";
        }
        else if (0 > date && date > -2) {
            text = "In 1 week";
        }
        else if (date <= -2) {
            text = "In " + Math.abs(date) + " weeks";
        }
        return text;
    };
    convertToSentence = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({
            name: 'convertToSentence',
        })
    ], convertToSentence);
    return convertToSentence;
}());

//# sourceMappingURL=converttosentence.pipe.js.map

/***/ }),

/***/ 470:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Connectivity; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_native_network__ = __webpack_require__(356);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(44);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var Connectivity = (function () {
    function Connectivity(platform, network) {
        this.platform = platform;
        this.network = network;
        this.onDevice = this.platform.is('cordova');
    }
    Connectivity.prototype.isOnline = function () {
        if (this.onDevice && this.network.type) {
            return this.network.type != 'none';
        }
        else {
            return navigator.onLine;
        }
    };
    Connectivity.prototype.isOffline = function () {
        if (this.onDevice && this.network.type) {
            return this.network.type == 'none';
        }
        else {
            return !navigator.onLine;
        }
    };
    Connectivity.prototype.watchOnline = function () {
        return this.network.onConnect();
    };
    Connectivity.prototype.watchOffline = function () {
        return this.network.onDisconnect();
    };
    Connectivity = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["m" /* Platform */], __WEBPACK_IMPORTED_MODULE_1__ionic_native_network__["a" /* Network */]])
    ], Connectivity);
    return Connectivity;
}());

//# sourceMappingURL=connectivity.js.map

/***/ }),

/***/ 471:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_native_splash_screen__ = __webpack_require__(138);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(139);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ngx_translate_core__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_ionic_angular__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_in_app_browser__ = __webpack_require__(118);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






//import { Settings } from '../providers/providers';
var MyApp = (function () {
    function MyApp(translate, platform, 
        // settings: Settings, 
        config, statusBar, splashScreen, iab) {
        var _this = this;
        this.translate = translate;
        this.config = config;
        this.statusBar = statusBar;
        this.splashScreen = splashScreen;
        this.iab = iab;
        //rootPage = FirstRunPage;
        this.rootPage = 'PlantsPage';
        this.pages = [
            { title: 'GROVER', component: 'WelcomePage' },
            { title: 'Plants', component: 'PlantsPage' },
        ];
        platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            _this.statusBar.styleDefault();
            _this.splashScreen.hide();
        });
        this.initTranslate();
    }
    MyApp.prototype.initTranslate = function () {
        var _this = this;
        // Set the default language for translation strings, and the current language.
        this.translate.setDefaultLang('en');
        var browserLang = this.translate.getBrowserLang();
        if (browserLang) {
            if (browserLang === 'zh') {
                var browserCultureLang = this.translate.getBrowserCultureLang();
                if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
                    this.translate.use('zh-cmn-Hans');
                }
                else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
                    this.translate.use('zh-cmn-Hant');
                }
            }
            else {
                this.translate.use(this.translate.getBrowserLang());
            }
        }
        else {
            this.translate.use('en'); // Set your language here
        }
        this.translate.get(['BACK_BUTTON_TEXT']).subscribe(function (values) {
            _this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
        });
    };
    MyApp.prototype.openPage = function (page) {
        this.nav.setRoot(page.component);
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])(__WEBPACK_IMPORTED_MODULE_4_ionic_angular__["j" /* Nav */]),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["j" /* Nav */])
    ], MyApp.prototype, "nav", void 0);
    MyApp = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            template: "<ion-menu [content]=\"content\">\n    <ion-header>\n      <ion-toolbar>\n        <ion-title>Menu</ion-title>\n      </ion-toolbar>\n    </ion-header>\n\n    <ion-content>\n      <ion-list>\n        <button menuClose ion-item *ngFor=\"let p of pages\" (click)=\"openPage(p)\">\n          {{p.title}}\n        </button>\n      </ion-list>\n    </ion-content>\n\n  </ion-menu>\n  <ion-nav #content [root]=\"rootPage\"></ion-nav>"
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_3__ngx_translate_core__["c" /* TranslateService */],
            __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["m" /* Platform */],
            __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["b" /* Config */],
            __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */],
            __WEBPACK_IMPORTED_MODULE_1__ionic_native_splash_screen__["a" /* SplashScreen */],
            __WEBPACK_IMPORTED_MODULE_5__ionic_native_in_app_browser__["a" /* InAppBrowser */]])
    ], MyApp);
    return MyApp;
}());

//# sourceMappingURL=app.component.js.map

/***/ })

},[360]);
//# sourceMappingURL=main.js.map