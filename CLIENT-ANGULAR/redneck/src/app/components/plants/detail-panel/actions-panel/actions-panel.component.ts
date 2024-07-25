import { Component, Input, OnChanges } from '@angular/core';
import { DbService } from '../../../../services/db/db.service';
import { PlantExtended } from '../../../../interfaces/plant';
import { RoomExtended } from '../../../../interfaces/room';
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
  IonCardTitle,
  IonCardContent,
  IonSegment,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-actions-panel',
  standalone: true,
  imports: [IonButton, IonSegment, IonCardContent, IonCardTitle, IonCard],
  templateUrl: './actions-panel.component.html',
  styleUrl: './actions-panel.component.scss',
})
export class ActionsPanelComponent implements OnChanges {
  @Input() plant: PlantExtended | undefined;
  @Input() room: RoomExtended | undefined;

  probes: any;
  workers: any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const { role } = await toast.onDidDismiss();
    if (this.debug) {
      console.log('onDidDismiss resolved with role', role);
    }
  }

  setup() {
    const probes = {
      temp: this.plant?.probes?.find(
        (el) => el.type.id === ProbesTypes.Water_temperature,
      ),
      waterLevel: this.plant?.probes?.find(
        (el) => el.type.id === ProbesTypes.Water_level,
      ),
      ec: this.plant?.probes?.find((el) => el.type.id === ProbesTypes.EC),
      ph: this.plant?.probes?.find((el) => el.type.id === ProbesTypes.pH),
    };
    if (probes.temp !== undefined) {
      probes.temp.type.maxWarningValue = this.plant?.phase?.maxTemp;
      probes.temp.type.minWarningValue = this.plant?.phase?.minTemp;
      probes.temp.value = 0;
      this.read(probes.temp.id);
    }
    if (probes.waterLevel !== undefined) {
      probes.waterLevel.type.maxWarningValue = this.plant?.phase?.maxWaterLevel;
      probes.waterLevel.type.minWarningValue = this.plant?.phase?.minWaterLevel;
      probes.waterLevel.value = 0;
      this.read(probes.waterLevel.id);
    }
    if (probes.ph !== undefined) {
      probes.ph.type.maxWarningValue = this.plant?.phase?.maxPh;
      probes.ph.type.minWarningValue = this.plant?.phase?.minPh;
      probes.ph.value = 0;
      this.read(probes.ph.id);
    }
    if (probes.ec !== undefined) {
      probes.ec.type.maxWarningValue = this.plant?.phase?.maxEC;
      probes.ec.type.minWarningValue = this.plant?.phase?.minEC;
      probes.ec.value = 0;
      this.read(probes.ec.id);
    }

    const workers = {
      waterLoop: (this.plant as any).workers.find(
        (el: any) => el.type.id === WorkersTypes.Pot_Water_loop,
      ),
      refill: (this.plant as any).workers.find(
        (el: any) => el.type.id === WorkersTypes.Pot_refill,
      ),
    };

    this.probes = probes as any;
    this.workers = workers as any;
  }

  async read(id: any) {
    if (id) {
      this.runRemoteCommand(
        ServerPages.actuators,
        ServerCommands.READ,
        id,
        Peripherals.Probe,
      ).then((response: any) => {
        if (response.error) {
          const header = `Error`;
          const message = response.error;
          const color = 'danger';
          const duration = 3000;
          this.presentToast(header, message, color, duration);
        } else {
          this.probes.temp.value = response.value;
          const header = `Success`;
          const message = `Action executed`;
          const color = 'success';
          const duration = 3000;
          this.presentToast(header, message, color, duration);
        }
      });
    } else {
      const header = `Error`;
      const message = `Probe ID not defined`;
      const color = 'danger';
      const duration = 3000;
      this.presentToast(header, message, color, duration);
    }
  }

  async toggleWaterRecycle(worker: any) {
    const action =
      worker.status === DevicesStatus.ON
        ? ServerCommands.OFF
        : ServerCommands.ON;
    this.runRemoteCommand(
      ServerPages.actuators,
      action,
      worker.id,
      Peripherals.Worker,
    );
  }

  async fillWaterLevel(id: any) {
    const duration = 1000;
    this.runRemoteCommand(
      ServerPages.actuators,
      ServerCommands.RUN_WATER,
      id,
      Peripherals.Worker,
      duration,
    );
  }

  async fillPhDown(id: any) {
    const duration = 1000;
    this.runRemoteCommand(
      ServerPages.actuators,
      ServerCommands.RUN_PHDOWN,
      id,
      Peripherals.Worker,
      duration,
    );
  }

  // async shufflePhDown(id: any) {
  //   this.runRemoteCommand(ServerPages.actuators, ServerCommands.RUN_PHDOWN, id, Peripherals.Worker)
  //     .then ((response) => {
  //       const value = response;
  //     })
  //     .catch (() => {});
  // }

  async fillNutrient(id: any) {
    const duration = 1000;
    this.runRemoteCommand(
      ServerPages.actuators,
      ServerCommands.RUN_DOSE,
      id,
      Peripherals.Worker,
      duration,
    );
  }

  // async shuffleNutrient(id: any) {
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
    duration?: any,
  ) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      this.db.api
        .remoteDeviceExecute(
          this.room?.settings?.address,
          this.room?.settings?.port,
          page,
          action,
          id,
          type,
          duration,
        )
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
    });
  }
}
