import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { NetworkService } from '../../../services/network/network.service';
import { ChartComponent } from '../../../components/chart/chart.component';
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
import { Plant } from '../../../interfaces/plant';
import { ReportComponent } from '../../../components/report/report/report.component';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    ChartComponent,
    ReportComponent,
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
  elementId: Number | null = null;

  isOnline = false;
  isReadyToSave = false;
  showForm = true;
  form: FormGroup = new FormGroup({});

  plant = { id_pot: null };
  companies: Company[] = [];
  strains: Strain[] = [];
  g_scenarios: GrowingScenario[] = [];
  g_mediums: GrowingMedium[] = [];

  default = {
    containers: [],
    containersType: [],
    probesList: [],
    probesLog: [],
    probesType: [],
    workersList: [],
    workersLog: [],
    workersType: [],
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
        id_strain: ['', Validators.required],
        generation: ['', Validators.required],
        day_start_grow: ['', Validators.required],
        revenue: [''],
        alerts: [''],
        id: [''],
        id_company: ['', Validators.required],
        id_growing_scenario: ['', Validators.required],
        id_growing_medium: ['', Validators.required],
        enabled: [''],
        deleted: [''],
        lastUpdate: [''],
      },
      {},
    );

    this.isOnline = navigator.onLine;
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.isOnline && this.form.valid;
    });
  }

  ionViewWillEnter() {
    this.db
      .load()
      .then(() => {
        const id: any = this.route.snapshot.paramMap.get('id');
        this.getItem(parseInt(id));
      })
      .catch((err) => console.error(err));
  }

  goBack() {
    this.router.navigate([this.page]);
  }

  getItem(id: Number) {
    this.elementId = id;
    const companiesP = this.db.getItems('companies');
    const strainsP = this.db.getItems('strains');
    const g_scenariosP = this.db.getItems('scenarios');
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
    //     companiesP, strainsP, g_scenariosP, g_mediumP
    // ])
    // .then(([
    //     companies, strains, g_scenarios, g_mediums
    // ]) => {
    Promise.all([
      companiesP,
      strainsP,
      g_scenariosP,
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
        g_scenarios,
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
        this.companies = companies;
        this.strains = strains;
        this.g_scenarios = g_scenarios;
        this.g_mediums = g_mediums;
        if (id) {
          this.db.getItem(this.page, id).then((plant) => {
            plant.day_harvest = plant.day_harvest
              ? new Date(plant.day_harvest).toISOString()
              : false;
            plant.day_pruning = plant.day_pruning
              ? new Date(plant.day_pruning).toISOString()
              : false;
            plant.day_second_trimming = plant.day_second_trimming
              ? new Date(plant.day_second_trimming).toISOString()
              : false;
            plant.day_start_bloom = plant.day_start_bloom
              ? new Date(plant.day_start_bloom).toISOString()
              : false;
            plant.day_start_grow = plant.day_start_grow
              ? new Date(plant.day_start_grow).toISOString()
              : false;
            plant.day_trimming = plant.day_trimming
              ? new Date(plant.day_trimming).toISOString()
              : false;

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
    const saveItem = Array();
    saveItem.push(this.form.value);
    this.db.putItems(this.page, saveItem).then((result) => {
      this.router.navigate([this.page]);
    });
  }
}
