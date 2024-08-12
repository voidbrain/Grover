import { Component, OnInit, ViewChildren } from '@angular/core';
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
    page = 'calendars';
    relatedPhases: any;
    phases: any;
    table = 'calendars';
    @ViewChildren('slidingItems') private slidingItems: IonItemSliding[];
    isOnline = false;
    isReadyToSave = false;
    showForm = true;
    showSubForm = false;
    form: FormGroup;
    item;

    newPhase = {
        phase: null,
        duration: null
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
            name						: ['', Validators.required],
            description					: [''],
            id							: [''],
            enabled						: [''],
            deleted						: [''],
            lastUpdate					: [''],
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
        if (id) {
            const itemP = this.db.getItem(this.page, id);
            const dosesP = this.db.getItems('doses');
            Promise.all([itemP, dosesP]).then(([item, doses]) => {
                this.phases = doses;
                this.item = item;
                this.item.phases = this.item.phases || [];
                this.form.patchValue(item, {emitEvent: true});
                this.buildGraph();
            });
        }
    }

    buildGraph() {
        const item = this.item;
        const doses = this.phases;
        if (item.phases) {
            item.phases.forEach(phase => {
                phase.chartConfig = {};
                const dose = doses.find( el => el.id == phase.id);
                if (dose) {
                    phase.name = dose.name;
                    phase.chartConfig = {
                        id: 'chart',
                        type : 'bar',
                        legend: false,
                        data: {
                            labels: ['Gro', 'Micro', 'Bloom', 'Ripen', 'EC'],
                            datasets: [{
                                data: [dose.gro, dose.micro, dose.bloom, dose.ripen, dose.EC],
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
                        //     show: false,
                        //     gridLines : {
                        //         display : false
                        //     }
                        // },
                        xAxes: [{
                            id: 'xAxis2',
                            gridLines : {
                                display : false
                            },
                            display: false,
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
                                left: 100,
                                right: 0,
                                top: 20,
                                bottom: 0
                            }
                        }
                    };
                }
            });
        } else {
            item.phases = [];
        }
        this.relatedPhases = item.phases;
    }

    addConnectivityListeners(): void {
        this.network.watchOnline().subscribe(() => {
            console.info('online');
            this.isOnline = true;
            this.isReadyToSave = this.form.valid;
        });

        this.network.watchOffline().subscribe(() => {
            console.info('offline');
            this.isOnline = false;
            this.isReadyToSave = false;
        });
    }

    saveForm(value) {
        const saveItem = Array();
        saveItem.push(this.form.value);
        saveItem['phases'] = this.relatedPhases;
        saveItem['phases'].forEach((phase, index)=>{
            saveItem['phases'][index] = (({ id, pos, duration }) => ({ id, pos, duration }))(phase);
        });
        this.db.putItems(this.page, saveItem).then((result) => {
            this.router.navigate([this.page]);
        });
    }

    // getConnectedPhases() {
    //     const column = 'enabled, deleted, id_calendar';
    //     const forceLoading = true;

    //     this.db.getConnectedItems(this.table, column, this.id_rif).then((items) => {
    //         items.sort((a, b) => (a.pos > b.pos) ? 1 : ((b.pos > a.pos) ? -1 : 0));
    //         items.forEach((item, i) => {
    //             item.chartConfig = {};
    //             // item.chartConfig = {
    //             //     id: 'chart',
    //             //     type : 'bar',
    //             //     data: {
    //             //         labels: ['Gro', 'Micro', 'Bloom', 'Ripen', 'EC'],
    //             //         datasets: [{
    //             //             data: [item.gro, item.micro, item.bloom, item.ripen, item.EC],
    //             //             backgroundColor: [
    //             //                 'rgba(17, 176, 50, 1)',
    //             //                 'rgba(125, 17, 176, 1)',
    //             //                 'rgba(176, 17, 17, 1)',
    //             //                 'rgba(240, 215, 7, 1)',
    //             //                 'rgba(7, 18, 240, 1)'
    //             //             ],
    //             //             borderWidth: 1
    //             //         }]
    //             //     },
    //             //     x: {
    //             //         stacked: false,
    //             //         show: false,
    //             //     },
    //             //     y: {
    //             //         stacked: false,
    //             //         show: false,
    //             //     },
    //             //     labelsFontSize: 9,
    //             //     showValue: true
    //             // }
    //         });
    //         this.relatedPhases = items;
    //     });
    // }

    updateList(items): Promise<void> {
        return new Promise(resolve => {
                this.item.phases = [];
                items.forEach((phase, index) => {
                    this.item.phases[index] = (({ id, pos, duration }) => ({ id, pos, duration }))(phase);
                });

                this.db.putItems(this.table, [this.item]).then(() => {
                    this.buildGraph();
                    resolve();
                });
            });
    }

    deleteItem(item) {
        const filtered = this.relatedPhases.filter((el) => {
            return el.id != item.id;
        });
        this.updateList(filtered);
    }

    addPhase() {
        const pos = this.getNextPos();
        console.log(pos)
        const newPhase = {
            id: this.newPhase.phase,
            pos: pos,
            duration: this.newPhase.duration
        };
        
        this.newPhase.phase = this.newPhase.duration = null;
        this.showSubForm = false;

        if (this.relatedPhases === null) { this.relatedPhases = []; }

        this.relatedPhases.push(newPhase);
        this.item.phases = this.relatedPhases;
        this.item.phases.forEach((phase, index)=>{
            this.item.phases[index] = (({ id, pos, duration }) => ({ id, pos, duration }))(phase);
        });
        this.db.putItems(this.page, [this.item]).then(result => {
            this.buildGraph();
        });
    }

    getNextPos() {
        return (this.relatedPhases.length ? Math.max.apply(Math, this.relatedPhases.map(function(o) { return o.pos + 1; })) : 1) ;
    }

    // editItem(item) {
    //     const filtered = this.relatedPhases.filter((el) => {
    //         return el.id != item.id;
    //     });
    //     this.updateList(filtered, item.id);
    // }

    // showDetail(item) {
    //     this.slidingItem._results.map((el) => { el.closeOpened(); });
    //     this.router.navigate([this.table + '/edit', JSON.stringify(item.id)]);
    // }

    doRefresh(refresher) {
        this.slidingItem._results.map((el) => { el.closeOpened(); });
        const forceLoading = true;
        this.db.initService(forceLoading)
            .then(() => {
            //    this.getConnectedPhases();
                refresher.target.complete();
            })
            .catch(err => console.error(err));
    }

    reorder(event) {
        const originalPhases = this.relatedPhases;
        const draggedItem = this.relatedPhases.splice(event.detail.from, 1)[0];
        this.relatedPhases.splice(event.detail.to, 0, draggedItem);
        const update = [this.relatedPhases[event.detail.to], this.relatedPhases[event.detail.from]];
        
        const und = update.some(function(el) {
            return typeof el == 'undefined';
        });
        if (und) {
            this.relatedPhases = originalPhases;
        } else {
            update.forEach((el, index) => {
                if (el) {
                    el.pos = index;
                    el.lastUpdate = Date.now();
                } else {
                    update.splice(index, 1);
                }
                this.relatedPhases[index].pos = el.pos;
            });
            this.updateList(this.relatedPhases).then(() => {});
        }
        event.detail.complete();
    }

}
