import { Component, Input, ViewChild, ElementRef } from '@angular/core';
// import { DbService } from '../../services/db/db.service';

@Component({
    selector: 'report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.scss'],
})

export class ReportComponent {

    @Input() subject: any;
    @Input() default: any;
    @ViewChild('chart', {read: ElementRef}) chart;

    form = {
        dateFrom : new Date().toISOString(),
        dateTo : new Date().toISOString(),
        probesType : null,
        containers: null
    };

    // default = {
    //     containers : null,
    //     containersType : null,
    //     probesList : null,
    //     probesLog : null,
    //     probesType : null,
    //     workersList : null,
    //     workersLog : null,
    //     workersType : null,
    // };
    //dbInit = false;
    containers;

    constructor(
        // public db: DbService,
    ) {}

    ngOnInit() { }

    ngOnChanges(changes) {
        console.log(changes)
        if(changes.subject.currentValue){
            this.filterReport(changes.subject.currentValue)
        }
    }

    filterReport(id_pot = null) {
        let containers, probesType, from, to;

        if (this.form.containers) {
            containers = this.form.containers.map(function(item) { return parseInt(item, 10); });
            containers = this.default.containers.filter(function (el) {
                return containers.indexOf(el.id) >= 0;
            });
        }

        if (id_pot) {
            containers = this.default.containers.filter(function (el) {
                return el.id === parseInt(id_pot, 10);
            });
            console.log(id_pot, containers, this.default.containers)
        }

        if (this.form.probesType) {
            probesType = this.form.probesType.map(function(item) { return parseInt(item, 10); });
            probesType = this.default.probesType.filter(function (el) {
                return probesType.indexOf(el.id) >= 0;
            });
        }
        if (!containers) { containers = this.default.containers; }
        if (!probesType) { probesType = this.default.probesType; }

        from = new Date(new Date(new Date(this.form.dateFrom).toISOString()).setHours(0, 0, 0, 0));
        to = new Date(new Date(new Date(this.form.dateTo).toISOString()).setHours(23, 59, 59, 999));
        // console.log(this.default, containers, this.containers, this.default.containers)
        this.getStat(containers, probesType, from, to);
    }

    getStat(containers, probesType, startFrom, endTo) {
        // console.log(this.default)
        containers.forEach(pot => {
            const datetimeSet = new Set<any>(); // timeline array
            const dataset = []; // log matrix
            const yAxes = []; // axes matrix

            if (typeof pot.type !== 'object') {
                pot.type = this.default.containersType.find( el => el.id == pot.type);
            }
            pot.probes = this.default.probesList.filter( el => el.id_pot == pot.id);
            pot.probes.forEach((probe) => {
                probe.maxValue = 0;
                probe.type = this.default.probesType.find( el => el.id == probe.probe_type);
                probe.log = this.default.probesLog.filter( el => el.id_probe == probe.id);
                probe.log.forEach(log => {
                    const datetime = new Date(log.datetime);
                    if (startFrom < datetime && datetime < endTo && probesType.indexOf(probe.type.id)) {
                        probe.maxValue = (log.value > probe.maxValue ? log.value : probe.maxValue);
                        datetimeSet.add(log.datetime);
                    }
                });
            });

            pot.workers = this.default.workersList.filter( el => el.id_pot == pot.id);
            pot.workers.forEach(worker => {
                worker.type = this.default.workersType.find( el => el.id == worker.worker_type);
                worker.log = this.default.workersLog.filter( el => el.id_worker == worker.id);
                worker.log.forEach(log => {
                    const datetime = new Date(new Date(log.datetime ));
                    if (startFrom < datetime && datetime < endTo) { datetimeSet.add(log.datetime); } // timeline array
                });
            });

            const datetimeArray = Array.from(new Set(datetimeSet)).sort();
            // const daysSet = new Set<any>();
            // datetimeArray.forEach(log => {
            //     const midnight = new Date(new Date(new Date(log).toISOString()).setHours(23, 59, 59, 999)).toISOString();
            //     daysSet.add(midnight);
            // });
            // const timeDiff = endTo - startFrom;
            // const numOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            // const dataDays = [];
            // console.log(numOfDays);
            // for(let i=0; i<numOfDays; i++){
            //     dataDays.push(100, null);
            // }

            /**
             * build y-axis
            */
            probesType.map(type => {
                const found = pot.probes.find( el => el.type.id == type.id);
                if (found) {
                    yAxes.push({
                        gridLines : {
                            display : true
                        },
                        display: false,
                        stacked: false,
                        position: 'left',
                        id: 'y-axis' + type.id,
                        ticks: {
                            beginAtZero: true,
                            max: (found ? found.maxValue : 1),
                            fontColor: type.color,
                        },
                        scaleLabel: {
                            display: false,
                            labelString: type.type + ' (' + type.um + ')'
                        }
                    });
                }
            });

            /**
             * build dataset array (loop datetimeArray and check if the probe has a corresponding log)
            */
            pot.probes.map(probe => {
                if (probesType.find( el => el.id == probe.probe_type)) {
                    const dataProbe = [];
                    datetimeArray.forEach((timestamp) => {
                        const found = probe.log.find(el => el.datetime === timestamp);
                        dataProbe.push( (found ? found.value : null) );
                    });

                    dataset.push({
                        data: dataProbe,
                        xAxisID: 'xAxis1',
                        id: 'y-axis' + probe.probe_type,
                        label: probe.type.type + ' (' + probe.type.um + ')' ,
                        borderColor: probe.type.color,
                        backgroundColor: probe.type.color,
                        fill: false,
                        spanGaps: true
                    });
                }
            });

            // dataset.push({
            //     //data: [Array.from(new Set(daysSet)).sort()],
            //     data: dataDays,
            //     xAxisID: 'xAxis2'
            // });

            /**
             * datetimeArray in readable format
            */
            datetimeArray.forEach((el, index) => {
                el = new Date(el).toLocaleString('en-us', {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'});
                datetimeArray[index] = el;
            });

            /**
             * build chartConfig object
            */
            pot.chartConfig = {
                id: 'chart' + pot.id,
                type : 'line',
                legend: false,
                data: {
                    labels: datetimeArray,
                    datasets: dataset
                },
                // x: {
                //     stacked: false,
                //     show: true,
                //     gridLines : {
                //         display : true
                //     }
                // },
                xAxes: [{
                        id: 'xAxis1',
                        gridLines : {
                            display : false
                        },
                        display: true,
                    // },
                    // {
                    //     id: 'xAxis2',
                    //     gridLines : {
                    //         display : true
                    //     },
                    //     display: false,
                    }],
                yAxes: yAxes,
                labelsFontSize: 9,
                showValue: true,
                showLineTitle: true,
                layout: {
                    padding: {
                        left: 160,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                }
            };
        });
        this.containers = containers;
    }
}
