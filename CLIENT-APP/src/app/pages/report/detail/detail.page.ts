import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router  } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { NetworkService } from '../../../services/network/network.service';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.page.html',
    styleUrls: ['./detail.page.scss'],
})

export class DetailPage {
    page = 'report';
    subject;
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
        public router: Router
    ) {}

    ngOnInit(){
        this.db.load().then(() => {
            const containersP = this.db.getItems('containers');
            const containersTypeP = this.db.getItems('containers_type');
            const probesListP = this.db.getItems('probes_list');
            const probesLogP = this.db.getItems('probes_log');
            const probesTypeP = this.db.getItems('probes_type');
            const workersListP = this.db.getItems('workers_list');
            const workersLogP = this.db.getItems('workers_log');
            const workersTypeP = this.db.getItems('workers_type');

            Promise.all([containersP, containersTypeP, probesListP, probesLogP, probesTypeP, workersListP, workersLogP, workersTypeP])
                .then(([containers, containersType, probesList, probesLog, probesType, workersList, workersLog, workersType]) => {
                    this.default.containers = containers;
                    this.default.containersType = containersType;
                    this.default.probesList = probesList;
                    this.default.probesLog = probesLog;
                    this.default.probesType =  probesType;
                    this.default.workersList = workersList;
                    this.default.workersLog = workersLog;
                    this.default.workersType = workersType;

                    this.subject = undefined;
                });
        });
    }

    goBack() {
        this.router.navigate([this.page]);
    }
}
