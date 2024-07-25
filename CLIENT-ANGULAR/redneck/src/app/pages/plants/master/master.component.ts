/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/array-type */

import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ExpandableComponent } from '../../../components/shared/expandable/expandable.component';
import { DetailPanelComponent } from '../../../components/plants/detail-panel/detail-panel.component';
import {
  OperatingModes,
  WorkersTypes,
  DevicesStatus,
  ServerCommands,
  ServerPages,
  Peripherals,
  ProbesTypes,
} from '../../../../app/services/settings/enum';

import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faTemperatureHalf, faEye } from '@fortawesome/free-solid-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { CheckboxComponent } from '../../../components/shared/form/components/checkbox/checkbox.component';
import { Calendar, PhaseExtended } from '../../../interfaces/calendar';
import { Dose } from '../../../interfaces/dose';
import { PlantExtended } from '../../../interfaces/plant';
import { RoomExtended } from '../../../interfaces/room';
import { Pot } from '../../../interfaces/pot';
import { Strain } from '../../../interfaces/strain';
import { DbService } from '../../../services/db/db.service';
import { ToastController } from '@ionic/angular';
import { ProgressBarComponent } from '../../../components/plants/progress-bar/progress-bar.component';

import { ChartComponent } from '../../../components/shared/chart/chart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  IonReorder,
  IonReorderGroup,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonCardContent,
  IonCardTitle,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';

import { RangeComponent } from '../../../components/shared/range/range.component';

import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { FilterBarComponent } from '../../../components/plants/filter-bar/filter-bar.component';
import { GrowingResultsComponent } from '../../../components/plants/growing-results/growing-results.component';

@Component({
  selector: 'app-plants-master',
  standalone: true,
  imports: [
    RangeComponent,
    IonSegment,
    IonSegmentButton,
    IonCardTitle,
    IonCardContent,
    RouterLink,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    ChartComponent,
    IonButton,
    IonButtons,
    IonCard,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonRefresher,
    IonRefresherContent,
    IonReorder,
    IonReorderGroup,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    FilterBarComponent,
    FontAwesomeModule,
    ProgressBarComponent,
    GrowingResultsComponent,
    ExpandableComponent,
    DetailPanelComponent,
  ],
  templateUrl: './master.component.html',
  styleUrl: './master.component.scss',
})
export class PlantsMasterComponent implements OnInit {
  @ViewChildren('slidingItem') private slidingItem: any;
  @ViewChild(CheckboxComponent) form: CheckboxComponent | undefined;
  faTemperatureHalf = faTemperatureHalf;
  faEye = faEye;
  public id: any;
  items: PlantExtended[] = [];
  page = 'plants';
  debug = false;
  formDefinition: any;
  previousValid = false;

  remoteAddress = '';
  port: number | undefined;

  rooms: RoomExtended[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private db: DbService,
    private router: Router,
    public toastController: ToastController,
    private library: FaIconLibrary,
  ) {
    library.addIconPacks(fas);
    addIcons(ionIcons);
    this.formDefinition = {
      name: 'show',
      type: 'checkbox',
      label: 'Show',
      options: [
        { id: 0, isChecked: true, name: 'Veg' },
        { id: 1, isChecked: true, name: 'Bloom' },
        { id: 2, isChecked: false, name: 'Harvested' },
        { id: 3, isChecked: false, name: 'Nursery' },
      ],
      multiple: true,
    };
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ionViewWillEnter() {
    if (this.debug) {
      console.info('[PAGE]: Start');
    }
    this.db
      .load()
      .then(() => {
        this.getItems();
      })
      .catch((err) => console.error(err));
  }

  async getItems() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const settingsP: Promise<Array<any>> = this.db.getItems('settings');
    const itemsP: Promise<Array<PlantExtended>> = this.db.getItems(this.page);
    const potsP: Promise<Array<Pot>> = this.db.getItems('pots');
    const strainsP: Promise<Array<Strain>> = this.db.getItems('strains');
    const calendarP: Promise<Array<Calendar>> = this.db.getItems('calendars');
    const dosesP: Promise<Array<Dose>> = this.db.getItems('doses');
    const roomsP: Promise<Array<any>> = this.db.getItems('rooms');
    const locationsP: Promise<Array<any>> = this.db.getItems('locations');

    const workersP: Promise<Array<any>> = this.db.getItems('workers_list');
    const probesP: Promise<Array<any>> = this.db.getItems('probes_list');
    const workersTypeP: Promise<Array<any>> = this.db.getItems('workers_type');
    const probesTypeP: Promise<Array<any>> = this.db.getItems('probes_type');
    const workersScheduleP: Promise<Array<any>> =
      this.db.getItems('workers_schedule');
    const probesScheduleP: Promise<Array<any>> =
      this.db.getItems('probes_schedule');
    const column = 'id';
    const query: any[] = [];
    const workersLogP: Promise<Array<any>> = this.db.getItems(
      'workers_log',
      column,
      query,
    );
    const probesLogP: Promise<Array<any>> = this.db.getItems(
      'probes_log',
      column,
      query,
    );
    Promise.all([
      itemsP,
      strainsP,
      potsP,
      calendarP,
      dosesP,
      roomsP,
      locationsP,
      workersP,
      probesP,
      workersTypeP,
      probesTypeP,
      workersLogP,
      probesLogP,
      workersScheduleP,
      probesScheduleP,
      settingsP,
    ]).then(
      ([
        plants,
        strains,
        pots,
        calendar,
        doses,
        rooms,
        locations,
        workersList,
        probesList,
        workersType,
        probesType,
        workersLog,
        probesLog,
        workersSchedule,
        probesSchedule,
        settings,
      ]) => {
        self.items = plants;
        self.items.map(async (plant: PlantExtended) => {
          plant.calendar = calendar.find((el) => el.id === plant.idCalendar);
          plant.strain = (strains as any[]).find(
            (el) => el.id === plant.idStrain,
          );
          if (plant.idPot) {
            plant.pot = (pots as any[]).find((el) => el.id === plant.idPot);
            plant.pot.location = locations.find(
              (el) => el.id === plant?.pot?.locationId,
            );

            plant.workers = (workersList as any[]).filter(
              (el) => el.locationId === plant?.pot?.locationId,
            );
            plant.probes = (probesList as any[]).filter(
              (el) => el.locationId === plant?.pot?.locationId,
            );
            plant.probes.map((probe) => {
              probe.type = probesType.find((el) => el.id === probe.probeType);
              probe.log = probesLog.filter((el) => el.idProbe === probe.id);
              probe.schedule = probesSchedule.filter(
                (el) => el.idProbe === probe.id,
              );
            });
            plant.workers.map((worker) => {
              worker.type = workersType.find(
                (el) => el.id === worker.workerType,
              );
              worker.log = workersLog.filter((el) => el.idWorker === worker.id);
              worker.schedule = workersSchedule.filter(
                (el) => el.idWorker === worker.id,
              );
            });
            const waterLoop = plant.workers.find(
              (worker) => +worker.workerType === +WorkersTypes.Pot_Water_loop,
            );
            plant.workersComponents = { waterLoop };
            if (waterLoop) {
              plant.workersComponents.waterLoop.status = plant.workersComponents
                .waterLoop
                ? DevicesStatus.ON
                : DevicesStatus.OFF; // TODO
            }

            plant.calendar?.phases.forEach((phase) => {
              phase.dose = doses.find((el) => el.id === phase?.idDose);
            });
            const epochDiffGrow: number =
              new Date().getTime() -
              new Date(plant.dayStartGrow as number).getTime();
            plant.daysFromGrow = Math.ceil(
              epochDiffGrow / (1000 * 60 * 60 * 24),
            );
            const epochDiffBloom: number =
              new Date().getTime() -
              new Date(plant.dayStartBloom as number).getTime();
            (plant.daysFromBloom as any) = plant.dayStartBloom
              ? Math.ceil(epochDiffBloom / (1000 * 60 * 60 * 24))
              : null;
            const epochDiffFlush: number =
              new Date().getTime() -
              new Date(plant.dayStartFlush as number).getTime();
            (plant.daysFromFlush as any) = plant.dayStartFlush
              ? Math.ceil(epochDiffFlush / (1000 * 60 * 60 * 24))
              : null;

            let foundPhase: PhaseExtended | undefined;

            let endPhaseDay = 0;
            // let counter = countingDays;
            let flagSeedling = false;
            let flagBlooming = false;
            let flagFlushing = false;
            plant.calendar?.phases.forEach((plantPhase: PhaseExtended) => {
              const countingDays: any = plantPhase?.isFlushing
                ? plant.daysFromFlush
                : plantPhase?.isBlooming
                  ? plant.daysFromBloom
                  : plant.daysFromGrow;

              if (
                (plantPhase?.isBlooming && !flagBlooming) ||
                (plantPhase?.isFlushing && !flagFlushing) ||
                (!plantPhase?.isBlooming &&
                  !plantPhase?.isFlushing &&
                  !flagSeedling)
              ) {
                plantPhase.startPhaseDay = 0;
                //   counter = countingDays;
                flagSeedling =
                  !plantPhase?.isBlooming && !plantPhase?.isFlushing;
                flagBlooming = plantPhase?.isBlooming;
                flagFlushing = plantPhase?.isFlushing;
              } else {
                plantPhase.startPhaseDay = endPhaseDay;
              }
              endPhaseDay = plantPhase.startPhaseDay + plantPhase?.duration;

              if (countingDays > plantPhase.startPhaseDay) {
                foundPhase = plantPhase;
                // counter += plantPhase?.duration;
              }
            });
            plant.phase = foundPhase;
          }
        });
        plants = plants.filter(
          (el) =>
            (this.formDefinition.options.find((el: any) => el.id === 0)
              .isChecked
              ? el.dayStartGrow && !el.dayStartBloom
              : 0) ||
            (this.formDefinition.options.find((el: any) => el.id === 1)
              .isChecked
              ? el.dayStartBloom
              : 0) ||
            (this.formDefinition.options.find((el: any) => el.id === 2)
              .isChecked
              ? el.dayHarvest
              : 0),
        );
        plants.sort((a: any, b: any) => {
          if (+a.dayStartBloom === +b.dayStartBloom) {
            return +a.dayStartGrow > +b.dayStartGrow ? 1 : -1;
          } else {
            return +a.dayStartBloom > +b.dayStartBloom ? -1 : 1;
          }
        });

        self.rooms = rooms;
        self.rooms.map(async (room: RoomExtended) => {
          // room.visible =
          //   (

          //     (this.formDefinition.options.find(el => el.id === 0).isChecked && room.isVegetative) ||
          //     (this.formDefinition.options.find(el => el.id === 1).isChecked && room.isBlooming) ||
          //     (this.formDefinition.options.find(el => el.id === 2).isChecked && room.isHarvested) ||
          //     (this.formDefinition.options.find(el => el.id === 3).isChecked && room.isNursery)
          //   );
          room.settings = settings.find(
            (el) => el.device === room.serialNumber,
          );
          room.plants = [
            ...plants.filter(
              (plant) => plant.pot?.location?.parent === room.locationId,
            ),
            ...plants.filter(
              (plant) => plant.dayHarvest !== 0 && room.locationId === null,
            ),
          ];
          room.workers = workersList.filter(
            (el) => el.locationId === room.locationId,
          );
          room.probes = probesList.filter(
            (el) => el.locationId === room.locationId,
          );
          room.workers.map((worker) => {
            worker.type = workersType.find((el) => el.id === worker.workerType);
            worker.log = workersLog.find((el) => el.idWorker === worker.id);
            worker.schedule = workersSchedule.filter(
              (el) => el.idWorker === worker.id,
            );
          });
          room.probes.map((probe) => {
            probe.type = probesType.find((el) => el.id === probe.probeType);
            probe.log = probesLog.find((el) => el.idWorker === probe.id);
            probe.schedule = probesSchedule.filter(
              (el) => el.idProbe === probe.id,
            );
          });
          const airtemp = room.probes.find(
            (probe) => +probe.probeType === +ProbesTypes.Air_temperature,
          );
          room.probesComponents = { airtemp };
          if (airtemp) {
            room.probesComponents.airtemp.type.maxWarningValue =
              room?.plants[0]?.phase?.maxTemp;
            room.probesComponents.airtemp.type.minWarningValue =
              room?.plants[0]?.phase?.minTemp;
            self.read(room?.probesComponents?.airtemp);
          }

          const light = room?.workers.find(
            (worker) => +worker.workerType === +WorkersTypes.Room_Light,
          );
          const fan = room?.workers.find(
            (worker) => worker.workerType === WorkersTypes.Room_Fan,
          );
          const nutrientRefill = room?.workers.find(
            (worker) =>
              +worker.workerType === +WorkersTypes.Room_Nutrient_refill,
          );
          const phDown = room?.workers.find(
            (worker) => worker.workerType === WorkersTypes.Room_PhDown_refill,
          );
          room.workersComponents = { light, fan, nutrientRefill, phDown };
          if (light) {
            room.workersComponents.light.status = DevicesStatus.ON;
          } // TODO
          if (fan) {
            room.workersComponents.fan.status = DevicesStatus.ON;
          } // TODO

          const modes: any[] = [];
          const enumValues = Object.values(OperatingModes);
          const k = enumValues.slice(0, enumValues.length / 2);

          k.map((el: any) => {
            modes.push({
              name: el,
              value: OperatingModes[el],
            });
          });
          room.operatingModes = modes;
          if (room.settings) {
            room.operatingMode = room.operatingModes.find(
              (el) => +el.value === +room.settings.operatingMode,
            ).value;
          }
        });
        this.filterList();
        if (this.debug) {
          console.info('[PAGE]: Ready');
        }
      },
    );
  }

  deleteItem(item: PlantExtended) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });
    this.db.deleteItem(this.page, item).then(() => {
      this.getItems();
    });
  }

  showDetail(item: PlantExtended) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });
    this.router.navigate([
      '/pages/' + this.page + '/edit',
      JSON.stringify(item.id),
    ]);
  }

  doRefresh(refresher: any) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });
    const forceLoading = true;
    this.db
      .initService(forceLoading)
      .then(() => {
        this.getItems();
        refresher.target.complete();
      })
      .catch((err) => console.error(err));
  }

  filterList() {
    this.rooms.map(async (room: RoomExtended) => {
      room.visible =
        (this.formDefinition.options.find((el: any) => el.id === 0).isChecked &&
          room.isVegetative) ||
        (this.formDefinition.options.find((el: any) => el.id === 1).isChecked &&
          room.isBlooming) ||
        (this.formDefinition.options.find((el: any) => el.id === 2).isChecked &&
          room.isHarvested) ||
        (this.formDefinition.options.find((el: any) => el.id === 3).isChecked &&
          room.isNursery);
    });
  }

  expandItem(item: PlantExtended) {
    this.items.map((listItem) => {
      if (item === listItem) {
        listItem.expanded = !listItem.expanded;
      } else {
        listItem.expanded = false;
      }
      return listItem;
    });
  }

  async presentToast(header: any, message: any, color: any, duration: any) {
    const toast = await this.toastController.create({
      header,
      message,
      color,
      duration,
      icon: 'information-circle',
      position: 'top',
    });
    await toast.present();

    await toast.onDidDismiss();
  }

  async read(probe: any) {
    const room: any = this.rooms.find(
      (el) => el.locationId === probe.locationId,
    );
    const action = ServerCommands.READ;
    this.runRemoteCommand(
      room,
      ServerPages.actuators,
      action,
      probe.id,
      Peripherals.Probe,
    ).then((response: any) => {
      if (response.error) {
        const header = `Error`;
        const message = response.error;
        const color = 'danger';
        const duration = 3000;
        this.presentToast(header, message, color, duration);
      } else {
        room.probesComponents.airtemp.value = response.value;
        const header = `Success`;
        const message = `Action executed`;
        const color = 'success';
        const duration = 3000;
        this.presentToast(header, message, color, duration);
      }
    });
  }

  async toggleLight(worker: any) {
    const room: any = this.rooms.find(
      (el) => el.locationId === worker.locationId,
    );
    const action =
      worker.status === DevicesStatus.ON
        ? ServerCommands.OFF
        : ServerCommands.ON;
    this.runRemoteCommand(
      room,
      ServerPages.actuators,
      action,
      worker.id,
      Peripherals.Worker,
    );
  }

  async toggleFan(worker: any) {
    const room: any = this.rooms.find(
      (el) => el.locationId === worker.locationId,
    );
    const action =
      worker.status === DevicesStatus.ON
        ? ServerCommands.OFF
        : ServerCommands.ON;
    this.runRemoteCommand(
      room,
      ServerPages.actuators,
      action,
      worker.id,
      Peripherals.Worker,
    ).then((response: any) => {
      if (response.error) {
        const header = `Error`;
        const message = `Error occured`;
        const color = 'danger';
        const duration = 3000;
        this.presentToast(header, message, color, duration);
      }
    });
  }

  async setRoomStatus(event: any, room: RoomExtended) {
    this.runRemoteCommand(
      room,
      ServerPages.system,
      ServerCommands.SET_MODE,
      room.id,
      event.detail.value,
    ).then((response: any) => {
      room.operatingMode = +response.mode;
    });
  }

  async shufflePhDown(worker: any) {
    if (worker) {
      const room: any = this.rooms.find(
        (el) => el.locationId === worker.locationId,
      );
      const duration = 1000;
      this.runRemoteCommand(
        room,
        ServerPages.actuators,
        ServerCommands.RUN_PHDOWN,
        worker.id,
        Peripherals.Worker,
        duration,
      );
    }
  }

  async shuffleNutrient(worker: any) {
    if (worker) {
      const room: any = this.rooms.find(
        (el) => el.locationId === worker.locationId,
      );
      const duration = 1000;
      this.runRemoteCommand(
        room,
        ServerPages.actuators,
        ServerCommands.ON,
        worker.id,
        Peripherals.Worker,
        duration,
      );
    }
  }

  async runRemoteCommand(
    room: RoomExtended,
    page: string,
    action: string,
    id: number,
    type: string,
    duration?: any,
  ) {
    return new Promise(async (resolve, reject) => {
      this.db.api
        .remoteDeviceExecute(
          room?.settings?.address,
          room?.settings?.port,
          page,
          action,
          id,
          type,
          duration,
        )
        .then((run: any) => {
          if (run.error) {
            const header = `Error`;
            const message = `Error occured`;
            const color = 'danger';
            const duration = 3000;
            this.presentToast(header, message, color, duration);
            reject(run.error);
          }
          const header = `Success`;
          const message = `Action executed`;
          const color = 'success';
          const duration = 3000;
          this.presentToast(header, message, color, duration);
          resolve(run);
        })
        .catch((err) => {
          console.log(err);
          const header = `Error`;
          const message = `Error occured`;
          const color = 'danger';
          const duration = 3000;
          this.presentToast(header, message, color, duration);
          reject(err);
        });
    });
  }
}
