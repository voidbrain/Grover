import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { NetworkService } from '../../../services/network/network.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  IonReorder,
  IonReorderGroup,
  IonRow,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { Company } from '../../../interfaces/company';
import { Strain } from '../../../interfaces/strain';
import { GrowingScenario } from '../../../interfaces/growing-scenario';
import { GrowingMedium } from '../../../interfaces/growing-medium';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { Plant, VoidPlant } from '../../../interfaces/plant';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
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
    IonMenuToggle,
    IonRefresher,
    IonRefresherContent,
    IonReorder,
    IonReorderGroup,
    IonRow,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class PlantsDetailComponent {
  page = 'plants';
  elementId: number | null = null;

  isOnline = false;
  isReadyToSave = false;
  showForm = true;
  form: FormGroup = new FormGroup({});

  plant: Plant | VoidPlant = { idPot: null };
  companies: Company[] = [];
  strains: Strain[] = [];
  gScenarios: GrowingScenario[] = [];
  g_mediums: GrowingMedium[] = [];

  default = {
    containers: [] as any,
    containersType: [] as any,
    probesList: [] as any,
    probesLog: [] as any,
    probesType: [] as any,
    workersList: [] as any,
    workersLog: [] as any,
    workersType: [] as any,
  };

  constructor(
    private db: DbService,
    private network: NetworkService,
    private loadingController: LoadingController,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    this.init();
    addIcons(ionIcons);
  }

  init() {
    this.form = this.formBuilder.group(
      {
        idStrain: ['', Validators.required],
        generation: ['', Validators.required],
        dayStartGrow: ['', Validators.required],
        revenue: [''],
        alerts: [''],
        id: [''],
        idCompany: ['', Validators.required],
        idGrowingScenario: ['', Validators.required],
        idGrowingMedium: ['', Validators.required],
        enabled: [''],
        deleted: [''],
        lastUpdate: [''],
      },
      {},
    );

    this.isOnline = navigator.onLine;
    this.form.valueChanges.subscribe(() => {
      this.isReadyToSave = this.isOnline && this.form.valid;
    });
  }

  ionViewWillEnter() {
    this.db
      .load()
      .then(() => {
        const id: any = this.route?.snapshot?.paramMap.get('id')?.toString();
        this.getItem(parseInt(id));
      })
      .catch((err) => console.error(err));
  }

  goBack() {
    this.router.navigate([this.page]);
  }

  getItem(id: number) {
    this.elementId = id;
    const companiesP = this.db.getItems('companies');
    const strainsP = this.db.getItems('strains');
    const gScenariosP = this.db.getItems('scenarios');
    const g_mediumP = this.db.getItems('mediums');

    const containersP = this.db.getItems('containers');
    const containersTypeP = this.db.getItems('containers_type');
    const probesListP = this.db.getItems('probes_list');
    const probesLogP = this.db.getItems('probes_log');
    const probesTypeP = this.db.getItems('probes_type');
    const workersListP = this.db.getItems('workers_list');
    const workersLogP = this.db.getItems('workers_log');
    const workersTypeP = this.db.getItems('workers_type');

    // Promise.all([
    //     companiesP, strainsP, gScenariosP, g_mediumP
    // ])
    // .then(([
    //     companies, strains, gScenarios, g_mediums
    // ]) => {
    Promise.all([
      companiesP,
      strainsP,
      gScenariosP,
      g_mediumP,
      containersP,
      containersTypeP,
      probesListP,
      probesLogP,
      probesTypeP,
      workersListP,
      workersLogP,
      workersTypeP,
    ]).then(
      ([
        companies,
        strains,
        gScenarios,
        g_mediums,
        containers,
        containersType,
        probesList,
        probesLog,
        probesType,
        workersList,
        workersLog,
        workersType,
      ]) => {
        this.default.containers = containers;
        this.default.containersType = containersType;
        this.default.probesList = probesList;
        this.default.probesLog = probesLog;
        this.default.probesType = probesType;
        this.default.workersList = workersList;
        this.default.workersLog = workersLog;
        this.default.workersType = workersType;
        this.companies = companies as Company[];
        this.strains = strains as Strain[];
        this.gScenarios = gScenarios as GrowingScenario[];
        this.g_mediums = g_mediums as GrowingMedium[];
        if (id) {
          this.db.getItem(this.page, id).then((plantFromDb: unknown) => {
            const plant = plantFromDb as Plant;
            plant.dayHarvest = plant.dayHarvest
              ? +new Date(plant.dayHarvest).toISOString()
              : null;
            plant.dayPruning = plant.dayPruning
              ? +new Date(plant.dayPruning).toISOString()
              : null;
            plant.daySecondTrimming = plant.daySecondTrimming
              ? +new Date(plant.daySecondTrimming).toISOString()
              : null;
            plant.dayStartBloom = plant.dayStartBloom
              ? +new Date(plant.dayStartBloom).toISOString()
              : null;
            plant.dayStartGrow = plant.dayStartGrow
              ? +new Date(plant.dayStartGrow).toISOString()
              : null;
            plant.dayTrimming = plant.dayTrimming
              ? +new Date(plant.dayTrimming).toISOString()
              : null;

            this.plant = plant;
            this.form.patchValue(this.plant, { emitEvent: true });
          });
        }
      },
    );
  }

  addConnectivityListeners(): void {
    this.network.watchOnline().subscribe(() => {
      console.log('online');
      this.isOnline = true;
      this.isReadyToSave = this.form.valid;
    });

    this.network.watchOffline().subscribe(() => {
      console.log('offline');
      this.isOnline = false;
      this.isReadyToSave = false;
    });
  }

  saveForm() {
    const saveItem = [];
    saveItem.push(this.form.value);
    this.db.putItems(this.page, saveItem).then(() => {
      this.router.navigate([this.page]);
    });
  }
}
