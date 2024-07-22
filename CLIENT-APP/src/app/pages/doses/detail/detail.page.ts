import { Component } from '@angular/core';
import { LoadingController, PopoverController } from '@ionic/angular';
import { ActivatedRoute, Router  } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { NetworkService } from '../../../services/network/network.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {IonColor, ColorService} from '../../../services/color/color-service';
import {ColorPickerPopoverPage} from '../../../components/color-popover/color-picker-popover.page';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.page.html',
    styleUrls: ['./detail.page.scss'],
})

export class DetailPage {
    chart;
    page = 'doses';
    isOnline = false;
    isReadyToSave = false;
    showForm = true;
    form: FormGroup;
    calendars;

    public color: IonColor;

    constructor(
        public db: DbService,
        public network: NetworkService,
        public loadingController: LoadingController,
        private route: ActivatedRoute,
        public router: Router,
        private formBuilder: FormBuilder,
        public popoverController: PopoverController,

        public col: ColorService
    ) {
        this.form = formBuilder.group({
            name						: ['', Validators.required],
            gro							: ['', Validators.required],
            micro						: ['', Validators.required],
            bloom						: ['', Validators.required],
            ripen						: ['', Validators.required],
            EC							: ['', Validators.required],
            id							: [''],
            enabled						: [''],
            deleted						: [''],
            color						: [''],
            lastUpdate					: [''],
        }, {});

        this.chart = { chartConfig: {} };
        this.color = { key: '', value: '', friendlyName: '' };
        this.isOnline = navigator.onLine;
        this.form.valueChanges.subscribe((v) => {
            this.isReadyToSave = this.isOnline && this.form.valid;
        });
    }

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
        const calendarsP = this.db.getItems('calendars');
        Promise.all([calendarsP]).then(([calendars]) => {
            this.calendars = calendars;
            if (id) {
                this.db.getItem(this.page, id).then(item => {
                    item.chartConfig = {
                        id: 'chart',
                        type : 'bar',
                        legend: false,
                        data: {
                            labels: ['Gro', 'Micro', 'Bloom', 'Ripen', 'EC'],
                            datasets: [{
                                data: [item.gro, item.micro, item.bloom, item.ripen, item.EC],
                                backgroundColor: [
                                    'rgba(17, 176, 50, 1)',
                                    'rgba(125, 17, 176, 1)',
                                    'rgba(176, 17, 17, 1)',
                                    'rgba(240, 215, 7, 1)',
                                    'rgba(7, 18, 240, 1)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        // x: {
                        //     stacked: false,
                        //     show: true,
                        //     gridLines : {
                        //         display : false
                        //     }
                        // },
                        xAxes: [{
                            id: 'xAxis1',
                            gridLines : {
                                display : false
                            },
                            display: true,
                        }],
                        // y: {
                        //     stacked: false,
                        //     show: false,
                        // },
                        yAxes: [{
                            display: false,
                            stacked: false,
                            ticks: {beginAtZero: true},
                            gridLines : {
                                display : false
                            }
                        }],
                        labelsFontSize: 9,
                        showValue: true,
                        layout: {
                            padding: {
                                left: 0,
                                right: 0,
                                top: 20,
                                bottom: 0
                            }
                        }
                    };
                    this.form.patchValue(item, {emitEvent: true});
                    this.color = this.col.colorList.find( el => el.value == item.color);
                    console.log(this.col.colorList, this.color, item)
                    this.chart = item;
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

    async pickColor(ev: Event) {
        const popover = await this.popoverController.create({
            component: ColorPickerPopoverPage,
            event: ev,
            componentProps: {
                color: this.color
            }
        });

        popover.onDidDismiss()
            .then((data) => {
                const x = data['data']; // Here's returned value from popover
                    this.color = x || this.color;
                    this.form.controls['color'].setValue(this.color.value);
        });
        return await popover.present();
    }
}
