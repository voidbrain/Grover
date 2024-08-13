
export interface FormDefinition {
  name: string,
      type: string,
      label: string,
      options: [
        { id: number, isChecked: boolean, name: string },
        { id: number, isChecked: boolean, name: string },
        { id: number, isChecked: boolean, name: string },
        { id: number, isChecked: boolean, name: string },
      ],
      multiple: true,
}


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
  
  ScheduleTypes,
  ProbesTypes,
} from '../../../../app/services/settings/enum';

import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faTemperatureHalf, faEye } from '@fortawesome/free-solid-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { CheckboxComponent } from '../../../components/shared/form/components/checkbox/checkbox.component';
import { CalendarInterface, PhaseExtendedInterface } from '../../../interfaces/calendar';
import { DoseInterface } from '../../../interfaces/dose';
import { PlantExtendedInterface } from '../../../interfaces/plant';
import { RoomExtendedInterface } from '../../../interfaces/room';
import { PotInterface } from '../../../interfaces/pot';
// import { ProbeTypeInterface } from '../../../interfaces/probeType';
// import { WorkerTypeInterface } from '../../../interfaces/workerType';
import { StrainInterface } from '../../../interfaces/strain';
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
  IonSegmentButton,
  RefresherCustomEvent
} from '@ionic/angular/standalone';

import { RangeComponent } from '../../../components/shared/range/range.component';

import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { FilterBarComponent } from '../../../components/plants/filter-bar/filter-bar.component';
import { GrowingResultsComponent } from '../../../components/plants/growing-results/growing-results.component';
import { ProbeInterface } from '../../../interfaces/probe';
import { WorkerInterface } from '../../../interfaces/worker';
import { LocationInterface } from '../../../interfaces/location';
import { RoomSettingsInterface } from '../../../interfaces/settings';
import { WorkerLogInterface } from '../../../interfaces/workerLog';
import { ProbeLogInterface } from '../../../interfaces/probeLog';

export interface Obj {
  name: string,
  value: number
}

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
  @ViewChildren('slidingItems') private slidingItems: IonItemSliding[] = [];
  @ViewChild(CheckboxComponent) form: CheckboxComponent | undefined;
  faTemperatureHalf = faTemperatureHalf;
  faEye = faEye;
  public id?: number;
  items: PlantExtendedInterface[] = [];
  page = 'plants';
  debug = false;
  formDefinition!: FormDefinition ;

  remoteAddress = '';
  port: number | undefined;

  rooms: RoomExtendedInterface[] = [];

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
    this.id = +(this.activatedRoute?.snapshot?.paramMap?.get('id') ?? 0);
  }

  async ionViewWillEnter() {
    if (this.debug) {
      console.info('[PAGE]: Start');
    }
    await this.db.load();

    this.getItems();
  }

  async getItems() {
    const settings: RoomSettingsInterface[] = await this.db.getItems('settings') as RoomSettingsInterface[];
    let plants: PlantExtendedInterface[] = await this.db.getItems(this.page) as PlantExtendedInterface[];
    const pots: PotInterface[] = await this.db.getItems('pots') as PotInterface[];
    const strains: StrainInterface[] = await this.db.getItems('strains') as StrainInterface[];
    const calendar: CalendarInterface[] = await this.db.getItems('calendars') as CalendarInterface[];
    const doses: DoseInterface[] = await this.db.getItems('doses') as DoseInterface[];
    const rooms: RoomExtendedInterface[] = await this.db.getItems('rooms') as RoomExtendedInterface[];
    const locations: LocationInterface[] = await this.db.getItems('locations') as LocationInterface[];

    const workersList: WorkerInterface[] = await this.db.getItems('workers_list') as WorkerInterface[];
    const probesList: ProbeInterface[] = await this.db.getItems('probes_list') as ProbeInterface[];
    // const workersType: WorkerTypeInterface[] = await this.db.getItems('workers_type') as WorkerTypeInterface[];
    // const probesType: ProbeTypeInterface[] = await this.db.getItems('probes_type') as ProbeTypeInterface[];
    const probeType = ProbesTypes;
    const workerType = WorkersTypes;
    const workersSchedule: ScheduleTypes[] = await this.db.getItems('workers_schedule') as ScheduleTypes[];
    const probesSchedule: ScheduleTypes[] = await this.db.getItems('probes_schedule') as ScheduleTypes[];
    const column = 'id';
    const query: number[] = [];
    const workersLog: WorkerLogInterface[] = await this.db.getItems(
      'workers_log',
      column,
      query,
    ) as WorkerLogInterface[];
    const probesLog: ProbeLogInterface[] = await this.db.getItems(
      'probes_log',
      column,
      query,
    ) as ProbeLogInterface[];

    this.items = plants;
    this.items.map(async (plant: PlantExtendedInterface) => {
      plant.calendar = calendar.find((el) => el.id === plant.idCalendar);
      plant.strain = (strains).find((el) => el.id === plant.idStrain) as StrainInterface;
      if (plant.idPot) {
        plant.pot = (pots).find((el) => el.id === plant.idPot) as PotInterface;
        plant.pot.location = locations.find(
          (el) => el.id === plant?.pot?.locationId,
        );

        plant.workers = (workersList).filter(
          (el) => el.locationId === plant?.pot?.locationId,
        );
        plant.probes = (probesList).filter(
          (el) => el.locationId === plant?.pot?.locationId,
        );
        plant.probes.map((probe) => {
          probe.probeType = probeType.find((el) => el.id === probe.probeType);
          probe.log = probesLog.filter((el) => el.idProbe === probe.id);
          probe.schedule = probesSchedule.filter(
            (el) => el.idProbe === probe.id,
          );
        });
        plant.workers.map((worker) => {
          worker.workerType = workerType.find((el) => el.id === worker.workerType);
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
        plant.daysFromGrow = Math.ceil(epochDiffGrow / (1000 * 60 * 60 * 24));
        const epochDiffBloom: number =
          new Date().getTime() -
          new Date(plant.dayStartBloom as number).getTime();
        plant.daysFromBloom = plant.dayStartBloom
          ? Math.ceil(epochDiffBloom / (1000 * 60 * 60 * 24))
          : null;
        const epochDiffFlush: number =
          new Date().getTime() -
          new Date(plant.dayStartFlush as number).getTime();
        plant.daysFromFlush = plant.dayStartFlush
          ? Math.ceil(epochDiffFlush / (1000 * 60 * 60 * 24))
          : null;

        let foundPhase: PhaseExtendedInterface | undefined;

        let endPhaseDay = 0;
        // let counter = countingDays;
        let flagSeedling = false;
        let flagBlooming = false;
        let flagFlushing = false;
        plant.calendar?.phases.forEach((plantPhase: PhaseExtendedInterface) => {
          const countingDays = plantPhase?.isFlushing
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
            flagSeedling = !plantPhase?.isBlooming && !plantPhase?.isFlushing;
            flagBlooming = plantPhase?.isBlooming;
            flagFlushing = plantPhase?.isFlushing;
          } else {
            plantPhase.startPhaseDay = endPhaseDay;
          }
          endPhaseDay = plantPhase.startPhaseDay + plantPhase?.duration;

          if (countingDays! > plantPhase.startPhaseDay) {
            foundPhase = plantPhase;
            // counter += plantPhase?.duration;
          }
        });
        plant.phase = foundPhase;
      }
    });
    plants = plants.filter(
      (el) =>
        (this.formDefinition.options?.find((el) => el.id === 0)?.isChecked
          ? el.dayStartGrow && !el.dayStartBloom
          : 0) ||
        (this.formDefinition.options?.find((el) => el.id === 1)?.isChecked
          ? el.dayStartBloom
          : 0) ||
        (this.formDefinition.options?.find((el) => el.id === 2)?.isChecked
          ? el.dayHarvest
          : 0),
    );
    plants.sort((a, b) => {
      if (+a.dayStartBloom === +b.dayStartBloom) {
        return +a.dayStartGrow > +b.dayStartGrow ? 1 : -1;
      } else {
        return +a.dayStartBloom > +b.dayStartBloom ? -1 : 1;
      }
    });

    this.rooms = rooms;

    this.rooms.map(async (room: RoomExtendedInterface) => {
      room.settings = settings.find((el) => el.device === room.serialNumber);
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
        probe.schedule = probesSchedule.filter((el) => el.idProbe === probe.id);
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
        this.read(room?.probesComponents?.airtemp);
      }

      const light = room?.workers.find(
        (worker) => +worker.workerType === +WorkersTypes.Room_Light,
      );
      const fan = room?.workers.find(
        (worker) => worker.workerType === WorkersTypes.Room_Fan,
      );
      const nutrientRefill = room?.workers.find(
        (worker) => +worker.workerType === +WorkersTypes.Room_Nutrient_refill,
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

      const modes: Obj[] = [];
      const enumValues = Object.values(OperatingModes);
      const k = enumValues.slice(0, enumValues.length / 2);

      k.map((el) => {
        modes.push({
          name: el as string,
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
    console.log('[PAGE/PLANTS/MASTER]: ', rooms);

    this.filterList();
    if (this.debug) {
      console.info('[PAGE]: Ready');
    }
  }

  async deleteItem(item: PlantExtendedInterface) {
    this.slidingItems.map((el) => {
      el.closeOpened();
    });
    await this.db.deleteItem(this.page, item);
    this.getItems();
  }

  showDetail(item: PlantExtendedInterface) {
    this.slidingItems.map((el) => {
      el.closeOpened();
    });
    this.router.navigate([this.page + '/edit', JSON.stringify(item.id)]);
  }

  async doRefresh(refresher: RefresherCustomEvent) {
    this.slidingItems.map((el) => {
      el.closeOpened();
    });

    this.getItems();
    refresher.target.complete();
  }

  filterList() {
    this.rooms.map(async (room: RoomExtendedInterface) => {
      room.visible =
        (this.formDefinition.options.find((el) => el.id === 0).isChecked &&
          room.isVegetative) ||
        (this.formDefinition.options.find((el) => el.id === 1).isChecked &&
          room.isBlooming) ||
        (this.formDefinition.options.find((el) => el.id === 2).isChecked &&
          room.isHarvested) ||
        (this.formDefinition.options.find((el) => el.id === 3).isChecked &&
          room.isNursery);
    });
  }

  expandItem(item: PlantExtendedInterface) {
    this.items.map((listItem) => {
      if (item === listItem) {
        listItem.expanded = !listItem.expanded;
      } else {
        listItem.expanded = false;
      }
      return listItem;
    });
  }

  async presentToast(header: string, message: string, color: string, duration: number) {
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

  async read(probe) {
    const room = this.rooms.find(
      (el) => el.locationId === probe.locationId,
    );
    const action = ServerCommands.READ;
    const response = await this.runRemoteCommand(
      room,
      ServerPages.actuators,
      action,
      probe.id,
      Peripherals.Probe,
    );
    if (response["error"]) {
      const header = `Error`;
      const message = response["error"];
      const color = 'danger';
      const duration = 3000;
      this.presentToast(header, message, color, duration);
    } else {
      room.probesComponents.airtemp.value = response["value"];
      const header = `Success`;
      const message = `Action executed`;
      const color = 'success';
      const duration = 3000;
      this.presentToast(header, message, color, duration);
    }
  }

  async toggleLight(worker) {
    const room = this.rooms.find(
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

  async toggleFan(worker) {
    const room = this.rooms.find(
      (el) => el.locationId === worker.locationId,
    );
    const action =
      worker.status === DevicesStatus.ON
        ? ServerCommands.OFF
        : ServerCommands.ON;
    const response = await this.runRemoteCommand(
      room,
      ServerPages.actuators,
      action,
      worker.id,
      Peripherals.Worker,
    );
    if (response["error"]) {
      const header = `Error`;
      const message = `Error occured`;
      const color = 'danger';
      const duration = 3000;
      this.presentToast(header, message, color, duration);
    }
  }

  async setRoomStatus(event: unknown, room: RoomExtendedInterface) {
    const response = this.runRemoteCommand(
      room,
      ServerPages.system,
      ServerCommands.SET_MODE,
      room.id,
      event["detail"]["value"],
    );
    room.operatingMode = +response["mode"];
  }

  async shufflePhDown(worker) {
    if (worker) {
      const room = this.rooms.find(
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

  async shuffleNutrient(worker) {
    if (worker) {
      const room = this.rooms.find(
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
    room: RoomExtendedInterface,
    page: string,
    action: string,
    id: number,
    type: string,
    duration?: number,
  ) {
    return new Promise(async (resolve, reject) => {
      const run = this.db.api.remoteDeviceExecute(
        room?.settings?.address,
        room?.settings?.port,
        page,
        action,
        id,
        type,
        duration,
      );

      let header = ``;
      let message = ``;
      let color = '';

      const toastDuration = 3000;
      if (run.error) {
        header = `Error`;
        message = `Error occured`;
        color = 'danger';

        this.presentToast(header, message, color, toastDuration);
        reject(run.error);
      }
      header = `Success`;
      message = `Action executed`;
      color = 'success';
      this.presentToast(header, message, color, toastDuration);
      resolve(run);

      run.catch((err) => {
        console.log(err);
        const header = `Error`;
        const message = `Error occured`;
        const color = 'danger';
        this.presentToast(header, message, color, toastDuration);
        reject(err);
      });
    });
  }
}
