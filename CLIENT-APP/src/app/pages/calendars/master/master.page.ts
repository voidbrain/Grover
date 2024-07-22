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
    table = 'calendars';

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
        const dosesP = this.db.getItems('doses');
        Promise.all([itemsP, dosesP]).then(([items, doses]) => {
            items.map((item, i) => {
                if (typeof item.phases == 'string') {
                    if (item.phases != '') {item.phases = JSON.parse(item.phases); } else { item.phases = []; }
                }
                item.doses = item.phases;
                const valuesArr = [];
                if(item.doses && item.doses != null){
                    item.doses.forEach(dose => {
                        const phase = doses.find(el => el.id == dose.id);
                        valuesArr.push({
                            data: [Math.floor(dose.duration / 7)], // weeks
                            backgroundColor: [phase.color]
                        });
                    });
                    item.chartConfig = {
                        id: 'chart',
                        type : 'horizontalBar',
                        legend: false,
                        data: {
                            labels: ['Time'],
                            datasets: valuesArr
                        },
                        // x: {
                        //     stacked: true,
                        //     show: false,
                        //     gridLines : {
                        //         display : false
                        //     }
                        // },
                        xAxes: [{
                            id: 'xAxis1',
                            stacked: true,
                            gridLines : {
                                display : false
                            },
                            display: false,
                        }],
                        // y: {
                        //     stacked: true,
                        //     show: false,
                        // },
                        yAxes: [{
                            display: false,
                            stacked: true,
                            ticks: {beginAtZero: true},
                            gridLines : {
                                display : false
                            }
                        }],
                        labelsFontSize: 9,
                        showValue: true,
                        showLineTitle: false,
                        // layout: {
                        //     padding: {
                        //         left: 0,
                        //         right: 0,
                        //         top: 20,
                        //         bottom: 0
                        //     }
                        // }
                    };
                }
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
