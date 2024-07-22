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
    page = 'settings';

    isOnline = false;
    isReadyToSave = false;
    showForm = true;
    form: FormGroup;

    constructor(
        public db: DbService,
        public network: NetworkService,
        public loadingController: LoadingController,
        private route: ActivatedRoute,
        public router: Router,
        private formBuilder: FormBuilder
    ) {
        this.form = formBuilder.group({
            date_time			: ['', Validators.required],
            deleted				: [''],
            enabled				: [''],
            id					: [''],
            lastUpdate			: [''],
            night_mode_off 		: ['', Validators.required],
            night_mode_on 		: ['', Validators.required],
            pin_ec_gnd 			: ['', Validators.required],
            pin_ec_vcc 			: ['', Validators.required],
            pin_ph_gnd 			: ['', Validators.required],
            pin_ph_vcc 			: ['', Validators.required],
            pin_t_gnd 			: ['', Validators.required],
            pin_t_vcc 			: ['', Validators.required],
            store_data 			: ['', Validators.required],
            work_mode 			: ['', Validators.required],

        }, {});

        this.isOnline = navigator.onLine;
        this.form.valueChanges.subscribe((v) => {
            this.isReadyToSave = this.isOnline && this.form.valid;
        });
    }

    ngOnInit() {}

    ionViewWillEnter() {
        this.db.load().then(() => {
            this.getItem(1);
        }).catch(err => console.error(err));
    }

    goBack(){
        this.router.navigate([this.page]);
    }

    getItem(id) {
        // var companiesP = this.db.getItems('companies');
        // var strainsP = this.db.getItems('strains');
        // var g_scenariosP = this.db.getItems('scenarios');
        // var g_mediumP = this.db.getItems('mediums');
        // Promise.all([companiesP, strainsP, g_scenariosP, g_mediumP]).then(([companies, strains, g_scenarios, g_mediums]) => { 
        // 	this.companies = companies;
        // 	this.strains = strains; 
        // 	this.g_scenarios = g_scenarios; 
        // 	this.g_mediums = g_mediums;
            if (id){
                this.db.getItem(this.page, id).then(item => {
                    this.form.patchValue(item, {emitEvent: true});
                })
            }
        //});
    }

    addConnectivityListeners(): void {
        this.network.watchOnline().subscribe(() => {
            console.log("online")
            this.isOnline = true;
            this.isReadyToSave = this.form.valid;
        });

        this.network.watchOffline().subscribe(() => {
            console.log("offline")
            this.isOnline = false;
            this.isReadyToSave = false;
        });
    }

    saveForm(){
        let saveItem = Array(); 
        saveItem.push(this.form.value)
        this.db.putItems(this.page, saveItem).then((result) => {
            this.router.navigate([this.page]);
        })
    }
}
