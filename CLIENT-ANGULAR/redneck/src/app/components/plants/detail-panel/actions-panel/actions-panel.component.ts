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
  IonButton,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faFill } from '@fortawesome/free-solid-svg-icons';
import { ProbeInterface, ProbesListInterface } from '../../../../interfaces/probe';
import { WorkerInterface, WorkersListInterface } from '../../../../interfaces/worker';
import { ProbeTypeInterface } from '../../../../interfaces/probeType';
import { HTMLResponse } from '../../../../interfaces/utils';

export interface Obj {
  error: string,
  value: number
}

@Component({
  selector: 'app-actions-panel',
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonButton,
    IonSegment,
    IonSegmentButton,
    FontAwesomeModule,
  ],
  templateUrl: './actions-panel.component.html',
  styleUrl: './actions-panel.component.scss',
})
export class ActionsPanelComponent implements OnChanges {
  @Input() plant: PlantExtendedInterface | undefined;
  @Input() room: RoomExtendedInterface | undefined;

  faArrowsRotate = faArrowsRotate;
  faFill = faFill;

  probes?: ProbesListInterface;
  workers?: WorkersListInterface;
  debug = false;

  constructor(
    private db: DbService,
    private toastController: ToastController,
  ) {}

  ngOnChanges() {
    if (this.plant && this.plant !== undefined) {
      this.setup();
    }
  }

  async presentToast(
    header: string,
    message: string,
    color: string,
    duration: number,
  ) {
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
      temp: this.plant?.probes?.find(
        (el: ProbeInterface) => el?.type?.id === ProbesTypes.Water_temperature,
      ),
      waterLevel: this.plant?.probes?.find(
        (el: ProbeInterface) => el?.type?.id === ProbesTypes.Water_level,
      ),
      ec: this.plant?.probes?.find((el) => el?.type?.id === ProbesTypes.EC),
      ph: this.plant?.probes?.find((el) => el?.type?.id === ProbesTypes.pH),
    };
    if (probes.temp !== undefined) {
      (probes.temp.type as ProbeTypeInterface).maxWarningValue = this.plant?.phase?.maxTemp;
      (probes.temp.type as ProbeTypeInterface).minWarningValue = this.plant?.phase?.minTemp;
      probes.temp.value = 0;
      this.read(probes.temp.id);
    }
    if (probes.waterLevel !== undefined) {
      (probes.waterLevel.type as ProbeTypeInterface).maxWarningValue = this.plant?.phase?.maxWaterLevel;
      (probes.waterLevel.type as ProbeTypeInterface).minWarningValue = this.plant?.phase?.minWaterLevel;
      probes.waterLevel.value = 0;
      this.read(probes.waterLevel.id);
    }
    if (probes.ph !== undefined) {
      (probes.ph.type as ProbeTypeInterface).maxWarningValue = this.plant?.phase?.maxPh;
      (probes.ph.type as ProbeTypeInterface).minWarningValue = this.plant?.phase?.minPh;
      probes.ph.value = 0;
      this.read(probes.ph.id);
    }
    if (probes.ec !== undefined) {
      (probes.ec.type as ProbeTypeInterface).maxWarningValue = this.plant?.phase?.maxEC;
      (probes.ec.type as ProbeTypeInterface).minWarningValue = this.plant?.phase?.minEC;
      probes.ec.value = 0;
      this.read(probes.ec.id);
    }

    const workers = {
      waterLoop: this.plant?.workers?.find(
        (el: WorkerInterface) => el?.type?.id === WorkersTypes.Pot_Water_loop,
      ),
      refill: this.plant?.workers?.find(
        (el: WorkerInterface) => el?.type?.id === WorkersTypes.Pot_refill,
      ),
    };

    this.probes = probes;
    this.workers = workers;
  }

  async read(id: number) {
    if (id) {
      const response: HTMLResponse = await this.runRemoteCommand(
        ServerPages.actuators,
        ServerCommands.READ,
        id,
        Peripherals.Probe,
      );

      if (response.error) {
        const header = `Error`;
        const message = response.error;
        const color = 'danger';
        const duration = 3000;
        this.presentToast(header, message, color, duration);
      } else {
        if(this.probes?.temp){
          this.probes.temp.value = +response.value;
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
      worker?.status === DevicesStatus.ON
        ? ServerCommands.OFF
        : ServerCommands.ON;
    this.runRemoteCommand(
      ServerPages.actuators,
      action,
      worker.id,
      Peripherals.Worker,
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

  // async shuffleNutrient(id: number) {
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
    duration?: number,
  ): Promise<HTMLResponse> {
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
      const header = `Success`;
      const message = `Action executed`;
      const color = 'success';
      const toastDuration = 3000;
      this.presentToast(header, message, color, toastDuration);
      
      return result;
    } catch (err) {
      if (this.debug) {
        console.log(err);
      }
  
      const header = `Connection Error`;
      const message = `Error connecting to the Grover device`;
      const color = 'danger';
      const toastDuration = 3000;
      this.presentToast(header, message, color, toastDuration);
      
      throw err;
    }
  }
  
}
