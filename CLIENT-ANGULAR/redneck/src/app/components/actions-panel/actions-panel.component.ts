import { Component, Input, OnChanges } from '@angular/core';
import { IonCard, IonCardTitle, IonCardContent, IonSegment, IonButton } from "@ionic/angular/standalone";
import { SettingsService } from '../../services/settings/settings.service';
import { Plant } from '../../interfaces/plant';
import { Room } from '../../interfaces/room';
import { DbService } from '../../services/db/db.service';
import { ToastController } from '@ionic/angular';
import { WorkersType } from '../../services/settings/settings.service';

@Component({
  selector: 'app-actions-panel',
  standalone: true,
  imports: [IonButton, IonSegment, IonCardContent, IonCardTitle, IonCard, ],
  templateUrl: './actions-panel.component.html',
  styleUrl: './actions-panel.component.scss'
})
export class ActionsPanelComponent implements OnChanges {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() plant: Plant|null = null;
  @Input() room: Room|null = null;

  constructor(
    private settingsService: SettingsService,
    private db: DbService,
    private toastController: ToastController,
  ){
    
  }


  
ngOnChanges() {
    if (this.plant && this.plant !== undefined) {
        this.init();
    }
}
presentToast(header, message, color, duration) {
    
        const toast = this.toastController.create({
            header,
            message,
            color,
            duration,
            icon: 'information-circle',
            position: 'top',
        });
        toast.present();
        
    
}

  init() {
    const probes = {
        temp: ( this.plant === null || _a === void 0 ? void 0 : _a.probes) === null || _b === void 0 ? void 0 : _b.find(el => el.type.id === this.settingsService.ProbesTypes.Water_temperature),
        waterLevel: (_d = (_c = this.plant) === null || _c === void 0 ? void 0 : _c.probes) === null || _d === void 0 ? void 0 : _d.find(el => el.type.id === _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ProbesTypes.Water_level),
        ec: (_f = (_e = this.plant) === null || _e === void 0 ? void 0 : _e.probes) === null || _f === void 0 ? void 0 : _f.find(el => el.type.id === _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ProbesTypes.EC),
        ph: (_h = (_g = this.plant) === null || _g === void 0 ? void 0 : _g.probes) === null || _h === void 0 ? void 0 : _h.find(el => el.type.id === _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ProbesTypes.pH),
    };
    if (probes.temp !== undefined) {
        probes.temp.type.maxWarningValue = (_k = (_j = this.plant) === null || _j === void 0 ? void 0 : _j.phase) === null || _k === void 0 ? void 0 : _k.maxTemp;
        probes.temp.type.minWarningValue = (_m = (_l = this.plant) === null || _l === void 0 ? void 0 : _l.phase) === null || _m === void 0 ? void 0 : _m.minTemp;
        probes.temp.value = 0;
        this.read(probes.temp.id);
    }
    if (probes.waterLevel !== undefined) {
        probes.waterLevel.type.maxWarningValue = (_p = (_o = this.plant) === null || _o === void 0 ? void 0 : _o.phase) === null || _p === void 0 ? void 0 : _p.maxWaterLevel;
        probes.waterLevel.type.minWarningValue = (_r = (_q = this.plant) === null || _q === void 0 ? void 0 : _q.phase) === null || _r === void 0 ? void 0 : _r.minWaterLevel;
        probes.waterLevel.value = 0;
        this.read(probes.waterLevel.id);
    }
    if (probes.ph !== undefined) {
        probes.ph.type.maxWarningValue = (_t = (_s = this.plant) === null || _s === void 0 ? void 0 : _s.phase) === null || _t === void 0 ? void 0 : _t.maxPh;
        probes.ph.type.minWarningValue = (_v = (_u = this.plant) === null || _u === void 0 ? void 0 : _u.phase) === null || _v === void 0 ? void 0 : _v.minPh;
        probes.ph.value = 0;
        this.read(probes.ph.id);
    }
    if (probes.ec !== undefined) {
        probes.ec.type.maxWarningValue = (_x = (_w = this.plant) === null || _w === void 0 ? void 0 : _w.phase) === null || _x === void 0 ? void 0 : _x.maxEC;
        probes.ec.type.minWarningValue = (_z = (_y = this.plant) === null || _y === void 0 ? void 0 : _y.phase) === null || _z === void 0 ? void 0 : _z.minEC;
        probes.ec.value = 0;
        this.read(probes.ec.id);
    }
    const workers = {
        waterLoop: this.plant.workers.find(el => el.type.id === this.WorkersTypes.Pot_Water_loop),
        refill: this.plant.workers.find(el => el.type.id === this.WorkersTypes.Pot_refill),
    };
    this.probes = probes;
    this.workers = workers;
}
read(id) {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_4__.__awaiter)(this, void 0, void 0, function* () {
        if (id) {
            this.runRemoteCommand(_services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ServerPages.actuators, _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ServerCommands.READ, id, _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.Peripherals.Probe)
                .then((response) => {
                if (response.error) {
                    const header = `Error`;
                    const message = response.error;
                    const color = 'danger';
                    const duration = 3000;
                    this.presentToast(header, message, color, duration);
                }
                else {
                    this.probes.temp.value = response.value;
                    const header = `Success`;
                    const message = `Action executed`;
                    const color = 'success';
                    const duration = 3000;
                    this.presentToast(header, message, color, duration);
                }
            })
                .catch(() => { });
        }
        else {
            const header = `Error`;
            const message = `Probe ID not defined`;
            const color = 'danger';
            const duration = 3000;
            this.presentToast(header, message, color, duration);
        }
    });
}

  fillWaterLevel(id) {
   
        const duration = 1000;
        this.runRemoteCommand(ServerPages.actuators, _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ServerCommands.RUN_WATER, id, _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.Peripherals.Worker, duration)
            .then((response) => {
            const value = response;
        })
            .catch(() => { });
    
}
fillPhDown(id) {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_4__.__awaiter)(this, void 0, void 0, function* () {
        const duration = 1000;
        this.runRemoteCommand(_services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ServerPages.actuators, _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ServerCommands.RUN_PHDOWN, id, _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.Peripherals.Worker, duration)
            .then((response) => {
            const value = response;
        })
            .catch(() => { });
    });
}
// async shufflePhDown(id) {
//   this.runRemoteCommand(ServerPages.actuators, ServerCommands.RUN_PHDOWN, id, Peripherals.Worker)
//     .then ((response) => {
//       const value = response;
//     })
//     .catch (() => {});
// }
fillNutrient(id) {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_4__.__awaiter)(this, void 0, void 0, function* () {
        const duration = 1000;
        this.runRemoteCommand(_services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ServerPages.actuators, _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.ServerCommands.RUN_DOSE, id, _services_settings_enum__WEBPACK_IMPORTED_MODULE_3__.Peripherals.Worker, duration)
            .then((response) => {
            const value = response;
        })
            .catch(() => { });
    });
}
// async shuffleNutrient(id) {
//   this.runRemoteCommand(ServerPages.actuators, ServerCommands.ON, id, Peripherals.Worker)
//     .then ((response) => {
//       const value = response;
//     })
//     .catch (() => {});
// }

toggleWaterRecycle(){}

runRemoteCommand(page, action, id, type, duration) {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_4__.__awaiter)(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => (0,tslib__WEBPACK_IMPORTED_MODULE_4__.__awaiter)(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            this.db.api.remoteDeviceExecute((_b = (_a = this.room) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.address, (_d = (_c = this.room) === null || _c === void 0 ? void 0 : _c.settings) === null || _d === void 0 ? void 0 : _d.port, page, action, id, type, duration)
                .then((run) => {
                if (this.debug) {
                    console.log(run);
                }
                const header = `Success`;
                const message = `Action executed`;
                const color = 'success';
                const toastDuration = 3000;
                this.presentToast(header, message, color, toastDuration);
                resolve(run);
            })
                .catch((err) => {
                if (this.debug) {
                    console.log(err);
                }
                const header = `Connection Error`;
                const message = `Error connecting to the Grover device`;
                const color = 'danger';
                const toastDuration = 3000;
                this.presentToast(header, message, color, toastDuration);
                reject(err);
            });
        }));
    });
}

}
