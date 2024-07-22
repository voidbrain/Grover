import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router  } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { NetworkService } from '../../../services/network/network.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.page.html',
    styleUrls: ['./detail.page.scss'],
})

export class DetailPage implements OnInit {
    page = 'plants';
    elementId;

    isOnline = false;
    isReadyToSave = false;
    showForm = true;
    form: FormGroup;

    plant = {id_pot: null};
    companies;
    strains;
    g_scenarios;
    g_mediums;

    default = {
        containers: [],
        containersType: [],
        probesList: [],
        probesLog: [],
        probesType: [],
        workersList: [],
        workersLog: [],
        workersType: []
    };

    constructor(
        public db: DbService,
        public network: NetworkService,
        public loadingController: LoadingController,
        private route: ActivatedRoute,
        public router: Router,
        private formBuilder: FormBuilder
    ) {
        this.form = formBuilder.group({
            id_strain					: ['', Validators.required],
            generation					: ['', Validators.required],
            day_start_grow				: ['', Validators.required],
            revenue						: [''],
            alerts						: [''],
            id							: [''],
            id_company					: ['', Validators.required],
            id_growing_scenario			: ['', Validators.required],
            id_growing_medium			: ['', Validators.required],
            enabled						: [''],
            deleted						: [''],
            lastUpdate					: ['']
        }, {});

        this.isOnline = navigator.onLine;
        this.form.valueChanges.subscribe((v) => {
            this.isReadyToSave = this.isOnline && this.form.valid;
        });
    }

    ngOnInit() {}

    ionViewWillEnter() {
        this.db.load().then(() => {
            const id = this.route.snapshot.paramMap.get('id');
            this.getItem(parseInt(id));
        }).catch(err => console.error(err));
    }

    goBack() {
        this.router.navigate([this.page]);
    }

    getItem(id) {
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
        Promise.all([companiesP, strainsP, g_scenariosP, g_mediumP, containersP, containersTypeP, probesListP, probesLogP, probesTypeP, workersListP, workersLogP, workersTypeP])
            .then(([companies, strains, g_scenarios, g_mediums, containers, containersType, probesList, probesLog, probesType, workersList, workersLog, workersType]) => {
                this.default.containers = containers;
                this.default.containersType = containersType;
                this.default.probesList = probesList;
                this.default.probesLog = probesLog;
                this.default.probesType =  probesType;
                this.default.workersList = workersList;
                this.default.workersLog = workersLog;
                this.default.workersType = workersType;
                this.companies = companies;
                this.strains = strains; 
                this.g_scenarios = g_scenarios;
                this.g_mediums = g_mediums;
                if (id) {
                    this.db.getItem(this.page, id).then(plant => {
                        plant.day_harvest = (plant.day_harvest ? new Date(plant.day_harvest).toISOString() : false);
                        plant.day_pruning = (plant.day_pruning ? new Date(plant.day_pruning).toISOString() : false);
                        plant.day_second_trimming = (plant.day_second_trimming ? new Date(plant.day_second_trimming).toISOString() : false);
                        plant.day_start_bloom = (plant.day_start_bloom ? new Date(plant.day_start_bloom).toISOString() : false);
                        plant.day_start_grow = (plant.day_start_grow ? new Date(plant.day_start_grow).toISOString() : false);
                        plant.day_trimming = (plant.day_trimming ? new Date(plant.day_trimming).toISOString() : false);

                        this.plant = plant;
                        this.form.patchValue(this.plant, {emitEvent: true});
                    });
                }
        });
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

    saveForm(value) {
        const saveItem = Array();
        saveItem.push(this.form.value);
        this.db.putItems(this.page, saveItem).then((result) => {
            this.router.navigate([this.page]);
        });
    }
}
