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
    math = Math;
    @ViewChildren('slidingItem') private slidingItem;
	items: any;
    table: string = 'doses';

    constructor(
        public db: DbService,
        public loadingController: LoadingController,
        public router: Router
    ) { }

    ngOnInit() {}

    ionViewWillEnter() {
        console.info('[PAGE]: Start');

        this.db.load().then(() => {
            let forceLoading = true;
            this.db.initService(forceLoading).then(() => {
                this.getItems();
            });
        }).catch(err => console.error(err));
    }

    getItems() {
        this.db.getItems(this.table).then((items) => {
            let colors = [
                'rgba(17, 176, 50, 1)',
                'rgba(125, 17, 176, 1)',
                'rgba(176, 17, 17, 1)',
                'rgba(240, 215, 7, 1)',
                'rgba(7, 18, 240, 1)'
            ];
            items.map((item, i) => {
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
                    //     show: false,
                    //     gridLines : {
                    //         display : false
                    //     }
                    // },
                    xAxes: [{
                        id: 'xAxis1',
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
                            left: 0,
                            right: 0,
                            top: 20,
                            bottom: 0
                        }
                    }
                }
            });
            this.items = items;
            console.info('[PAGE]: Ready');
        });
    }

    deleteItem(item) {
        this.slidingItem._results.map((el) => { el.closeOpened(); });
        this.db.deleteItem(this.table, item).then((result) => {
            this.getItems()
        });
    }

    showDetail(item) {
        this.slidingItem._results.map((el) => { el.closeOpened(); });
        this.router.navigate([this.table + '/edit', JSON.stringify(item.id)]);
    }

    doRefresh(refresher) {
        this.slidingItem._results.map((el) => { el.closeOpened(); });
        let forceLoading = true;
        this.db.initService(forceLoading)
            .then(() => {
                this.getItems();
                refresher.target.complete();
            })
            .catch(err => console.error(err));
    }
}
