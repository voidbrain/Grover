import { Component, Input, OnChanges } from '@angular/core';
import { DbService } from '../../../../services/db/db.service';
import { PlantExtendedInterface } from '../../../../interfaces/plant';
import { RoomExtendedInterface } from '../../../../interfaces/room';
import { ToastController } from '@ionic/angular';
import {
  ProbesTypes,
  WorkersTypes,
  ServerCommands,
  ServerPages,
  Peripherals,
  DevicesStatus,
} from '../../../../services/settings/enum';
import {
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonCardContent,
  IonItem,
  IonButton,
  IonLabel,
  IonToggle,
  IonIcon,
} from '@ionic/angular/standalone';
import { RangeComponent } from '../../../shared/range/range.component';
import { DosesBarComponent } from '../doses-bar/doses-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRuler, faEye } from '@fortawesome/free-solid-svg-icons';
import { WorkerInterface, WorkersListInterface } from '../../../../interfaces/worker';
import { ProbesListInterface } from '../../../../interfaces/probe';
import { ProbeTypeInterface } from '../../../../interfaces/probeType';


export interface Obj {
  error: string,
  value: number
}

export interface Obj {
  error: string,
  value: number
}
@Component({
  selector: 'app-phase-details',
  templateUrl: './phase-details.component.html',
  styleUrls: ['./phase-details.component.scss'],
  imports: [
    IonIcon,
    IonToggle,
    IonLabel,
    IonButton,
    IonItem,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonCardContent,
    RangeComponent,
    DosesBarComponent,
    FontAwesomeModule,
  ],
  standalone: true,
})
export class PhaseDetailComponent implements OnChanges {
  faEye = faEye;
  faRuler = faRuler;

  @Input() plant!: PlantExtendedInterface;
  @Input() room!: RoomExtendedInterface;

  probes?: ProbesListInterface;
  workers?: WorkersListInterface;
  debug = false;

  constructor(
    private db: DbService,
    public toastController: ToastController,
  ) {}

  ngOnChanges() {
    if (this.plant && this.plant !== undefined) {
      this.setup();
    }
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

    const { role } = await toast.onDidDismiss();
    if (this.debug) {
      console.log('onDidDismiss resolved with role', role);
    }
  }

  setup() {
    const probes = {
      temp: this.plant.probes?.find(
        (el) => (el.type as ProbeTypeInterface).id === ProbesTypes.Water_temperature,
      ),
      waterLevel: this.plant.probes?.find(
        (el) => (el.type as ProbeTypeInterface).id === ProbesTypes.Water_level,
      ),
      ec: this.plant.probes?.find((el) => (el.type as ProbeTypeInterface).id === ProbesTypes.EC),
      ph: this.plant.probes?.find((el) => (el.type as ProbeTypeInterface).id === ProbesTypes.pH),
    };
    if (probes?.temp?.type !== undefined) {
      (probes.temp.type as ProbeTypeInterface).maxWarningValue = this.plant.phase?.maxTemp;
      (probes.temp.type as ProbeTypeInterface).minWarningValue = this.plant.phase?.minTemp;
      probes.temp.value = 0;
      this.read(probes.temp.id);
    }
    if (probes?.waterLevel?.type !== undefined) {
      (probes.waterLevel.type as ProbeTypeInterface).maxWarningValue = this.plant.phase?.maxWaterLevel;
      (probes.waterLevel.type as ProbeTypeInterface).minWarningValue = this.plant.phase?.minWaterLevel;
      probes.waterLevel.value = 0;
      this.read(probes.waterLevel.id);
    }
    if (probes?.ph?.type !== undefined) {
      (probes.ph.type as ProbeTypeInterface).maxWarningValue = this.plant.phase?.maxPh;
      (probes.ph.type as ProbeTypeInterface).minWarningValue = this.plant.phase?.minPh;
      probes.ph.value = 0;
      this.read(probes.ph.id);
    }
    if (probes?.ec?.type !== undefined) {
      (probes.ec.type as ProbeTypeInterface).maxWarningValue = this.plant.phase?.maxEC;
      (probes.ec.type as ProbeTypeInterface).minWarningValue = this.plant.phase?.minEC;
      probes.ec.value = 0;
      this.read(probes.ec.id);
    }

    const workers = {
      waterLoop: this.plant.workers?.find(
        (el) => el.type?.id === WorkersTypes.Pot_Water_loop,
      ),
      refill: this.plant.workers?.find(
        (el) => el.type?.id === WorkersTypes.Pot_refill,
      ),
    };

    this.probes = probes;
    this.workers = workers;
  }

  async read(id: number) {
    if (id) {
      const duration = 0;
      const response: Obj = await this.runRemoteCommand(
        ServerPages.actuators,
        ServerCommands.READ,
        id,
        Peripherals.Probe,
        duration
      );
      if (response.error) {
        const header = `Error`;
        const message = response.error;
        const color = 'danger';
        const duration = 3000;
        this.presentToast(header, message, color, duration);
      } else {
        if(this.probes?.temp){
          this.probes.temp.value = response.value;
          const header = `Success`;
          const message = `Action executed`;
          const color = 'success';
          const duration = 3000;
          this.presentToast(header, message, color, duration);
        }
      }
    } else {
      const header = `Error`;
      const message = `Probe ID not defined`;
      const color = 'danger';
      const duration = 3000;
      this.presentToast(header, message, color, duration);
    }
  }

  async toggleWaterRecycle(worker: WorkerInterface) {
    const action =
      worker.status === DevicesStatus.ON
        ? ServerCommands.OFF
        : ServerCommands.ON;
    const duration = 0;
    this.runRemoteCommand(
      ServerPages.actuators,
      action,
      worker.id,
      Peripherals.Worker,
      duration
    );
  }

  async fillWaterLevel(id: number) {
    const duration = 1000;
    this.runRemoteCommand(
      ServerPages.actuators,
      ServerCommands.RUN_WATER,
      id,
      Peripherals.Worker,
      duration,
    );
  }

  async fillPhDown(id: number) {
    const duration = 1000;
    this.runRemoteCommand(
      ServerPages.actuators,
      ServerCommands.RUN_PHDOWN,
      id,
      Peripherals.Worker,
      duration,
    );
  }

  // async shufflePhDown(id) {
  //   this.runRemoteCommand(ServerPages.actuators, ServerCommands.RUN_PHDOWN, id, Peripherals.Worker)
  //     .then ((response) => {
  //       const value = response;
  //     })
  //     .catch (() => {});
  // }

  async fillNutrient(id: number) {
    const duration = 1000;
    this.runRemoteCommand(
      ServerPages.actuators,
      ServerCommands.RUN_DOSE,
      id,
      Peripherals.Worker,
      duration,
    );
  }

  // async shuffleNutrient(id) {
  //   this.runRemoteCommand(ServerPages.actuators, ServerCommands.ON, id, Peripherals.Worker)
  //     .then ((response) => {
  //       const value = response;
  //     })
  //     .catch (() => {});
  // }

  async runRemoteCommand(
    page: string,
    action: string,
    id: number,
    type: string,
    duration: number,
  ): Promise<Obj> {
    try {
      const run = this.db.api.remoteDeviceExecute(
        this.room?.settings?.address as string,
        this.room?.settings?.port as number,
        page,
        action,
        id,
        type,
        duration,
      );
  
      if (this.debug) {
        console.log(run);
      }
  
      const result = await run; // Wait for the promise to resolve
  
      // Display success toast
      this.presentToast('Success', 'Action executed', 'success', 3000);
      
      return result;
    } catch (err) {
      if (this.debug) {
        console.log(err);
      }
  
      // Display error toast
      this.presentToast('Connection Error', 'Error connecting to the Grover device', 'danger', 3000);
      
      throw err; // Rethrow the error after handling it
    }
  }
  
}
