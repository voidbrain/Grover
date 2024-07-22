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
    table = 'strains';

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
		this.db.getItems(this.table).then((items) => {
            items.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            items.map((item) => {
                item.chartConfig = {
                    id: 'chart',
                    type : 'doughnut',
                    legend: false,
                    data: {
                        labels: ['Sativa', 'Indica'],
                        datasets: [{
                            data: [item.percent_sativa, (100 - item.percent_sativa)],
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
