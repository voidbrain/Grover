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
    page = 'strains';

    isOnline = false;
    isReadyToSave = false;
    showForm = true;
    form: FormGroup;
    item;
    strains;

    constructor(
        public db: DbService,
        public network: NetworkService,
        public loadingController: LoadingController,
        private route: ActivatedRoute,
        public router: Router,
        private formBuilder: FormBuilder
    ) {
        this.form = formBuilder.group({
            name						: ['', Validators.required],
            lineage						: ['', Validators.required],
            percent_sativa				: ['', Validators.required],
            id							: ['', ],
            enabled						: ['', ],
            deleted						: ['', ],
            lastUpdate					: ['', ],
        }, {});

        this.isOnline = navigator.onLine;
        this.form.valueChanges.subscribe((v) => {
            this.isReadyToSave = this.isOnline && this.form.valid;
        });

        // this.item = { chartConfig: {} };
        this.item = {};
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
        const strainsP = this.db.getItems('strains');
        Promise.all([strainsP]).then(([strains]) => {
            this.strains = strains;

            if (id) {
                this.db.getItem(this.page, id).then(item => {
                    item.lineage = item.lineage.split(',');
                    console.log(item.lineage);
                    item.lineage = item.lineage.map(function (x) { return parseInt(x); });
                    console.log(item.lineage);
                    this.form.patchValue(item, {emitEvent: true});
                    console.log(this.form);
                    // item.chartConfig = {
                    //     id: 'chart',
                    //     type : 'doughnut',
                    //     legend: false,
                    //     data: {
                    //         labels: ['Sativa', 'Indica'],
                    //         datasets: [{
                    //             data: [item.percent_sativa, (100 - item.percent_sativa)],
                    //             backgroundColor: [
                    //                 'rgba(17, 176, 50, 1)',
                    //                 'rgba(125, 17, 176, 1)'
                    //             ],
                    //             borderWidth: 1
                    //         }]
                    //     },
                    //     x: {
                    //         stacked: false,
                    //         show: false,
                    //     },
                    //     // y: {
                    //     //     stacked: false,
                    //     //     show: false,
                    //     // },
                    //     yAxes: [{
                    //         display: false,
                    //         stacked: false,
                    //     }],
                    //     labelsFontSize: 9,
                    //     showValue: false
                    // };
                    this.item = item;
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
