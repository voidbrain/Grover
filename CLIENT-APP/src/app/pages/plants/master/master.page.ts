import { Component, OnInit, ViewChildren } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DbService } from '../../../services/db/db.service';

@Component({
    selector: 'app-master',
    templateUrl: './master.page.html',
    styleUrls: ['./master.page.scss'],
})
export class MasterPage implements OnInit {
    @ViewChildren('slidingItem') private slidingItem;
    items: any;
    table = 'plants';

    constructor(
        public db: DbService,
        public loadingController: LoadingController,
        public router: Router
    ) { }

    ngOnInit() {}

    ionViewWillEnter() {
        console.info('[PAGE]: Start');
        this.db.load().then(() => {
            const forceLoading = true;
            this.db.initService(forceLoading).then(() => {
                this.getItems();
            });
        }).catch(err => console.error(err));
    }

    getItems() {
        const itemsP = this.db.getItems(this.table);
        const calendarsP = this.db.getItems('calendars');
        const dosesP = this.db.getItems('doses');
        const strainsP = this.db.getItems('strains');
        Promise.all([itemsP, calendarsP, dosesP, strainsP]).then(([items, calendars, doses, strains]) => {

            items.sort((a, b) => {
                const compare = (a.day_harvest != 0 && b.day_harvest != 0 ? 'day_harvest' :
                    (a.day_start_bloom != 0 && b.day_start_bloom != 0 ? 'day_start_bloom' :
                        (a.day_start_grow != 0 && b.day_start_grow != 0 ? 'day_start_grow' : 'id')
                    )
                );
                (a[compare] > b[compare] ? 1 : (b[compare] > a[compare] ? -1 : 0));
            });

            items.map(item => {
                item.strain = strains.find( el => el.id == item.id_strain);
                item.chartConfig = {
                    id: 'chart',
                    type : 'doughnut',
                    legend: false,
                    data: {
                        labels: ['Sativa', 'Indica'],
                        datasets: [{
                            data: [item.strain.percent_sativa, (100 - item.strain.percent_sativa)],
                            backgroundColor: [
                                'rgba(17, 176, 50, 1)',
                                'rgba(125, 17, 176, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    xAxes: [{
                        id: 'xAxis1',
                        gridLines : {
                            display : false
                        },
                        display: false,
                    }],
                    yAxes: [{
                        display: false,
                        stacked: false,
                        ticks: {beginAtZero: true},
                        gridLines : {
                            display : false
                        }
                    }],
                    labelsFontSize: 9,
                    showValue: false,
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0
                        }
                    }
                };
                const timeDiff = Math.abs(Date.now() - new Date((item.day_start_grow ? item.day_start_grow : Date.now())).getTime());
                item.weeks_n = Math.floor(Math.abs(timeDiff) / (1000 * 7 * 24 * 60 * 60));
                for (const phase of calendars) {
                    if (item.weeks_n < phase.duration) {
                        item.phase = phase;
                        break;
                    }
                }
                const dose = (item.phase ? item.phase : calendars[calendars.length - 1]);
                item.dose = doses.find((singleDose) => {singleDose.id == dose.id_dose; });
                // item.phase.days = timeDiff - (item.weeks_n / (1000 * 7 * 24 * 60 * 60));
                // let phase_days = item.phase.week_n;
                const item_days = Math.floor(Math.abs(timeDiff) / (7 * 24 * 60 * 60));
                // console.log(phase_days,item_days)
            });
            this.items = items;
            console.info('[PAGE]: Ready');
        });
    }

    deleteItem(item) {
        this.slidingItem._results.map((el) => { el.closeOpened(); });
        this.db.deleteItem(this.table, item).then((result) => {
            this.getItems();
        });
    }

    showDetail(item) {
        this.slidingItem._results.map((el) => { el.closeOpened(); });
        this.router.navigate([this.table + '/edit', JSON.stringify(item.id)]);
    }

    doRefresh(refresher) {
        this.slidingItem._results.map((el) => { el.closeOpened(); });
        const forceLoading = true;
        this.db.initService(forceLoading)
            .then(() => {
                this.getItems();
                refresher.target.complete();
            })
            .catch(err => console.error(err));
    }
}
