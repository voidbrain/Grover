import { Component, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import * as Chart from 'chart.js';

@Component({
    selector: 'chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
})

export class ChartComponent {

    @ViewChild('chart', {read: ElementRef}) chart;
    @Input() chartConfig;

    constructor(
        public renderer: Renderer2
    ) {}

    ngOnInit() {}

    ngOnChanges(changes) {
        const parent = this;
        if ('currentValue' in changes.chartConfig && changes.chartConfig.currentValue !== undefined) {
            if ('data' in changes.chartConfig.currentValue && changes.chartConfig.currentValue.data !== 'undefined') {
                const chart = new Chart(this.chart.nativeElement.getContext('2d'), {
                    type: parent.chartConfig.type,
                    data: parent.chartConfig.data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        title: { display: true },
                        legend: { display: parent.chartConfig.legend },
                        tooltips: { enabled: true },
                        scales: {
                            yAxes: parent.chartConfig.yAxes,
                            xAxes: parent.chartConfig.xAxes
                        },
                        layout: parent.chartConfig.layout,
                        events: [],
                        animation: {
                            onComplete : function(el) {
                                if (parent.chartConfig.showValue) {
                                    const ctx = this.chart.ctx;
                                    ctx.fontSize = parent.chartConfig.labelsFontSize + 'px';
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'center';
                                    Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                                        ctx.fillStyle = dataset.backgroundColor;
                                        const meta = chart.getDatasetMeta(i);
                                        Chart.helpers.each(meta.data.forEach(function (element, index) {
                                            const data = dataset.data[index];
                                            ctx.fillText(data, element._model.x - 2, element._model.y - 20);
                                        }), this);
                                    }), this);
                                }

                                if (parent.chartConfig.showLineTitle) {
                                    const ctxLegend = this.chart.ctx;
                                    ctxLegend.fillStyle = function(context) {
                                        return context.dataset.backgroundColor;
                                    };
                                    ctxLegend.fontSize = parent.chartConfig.labelsFontSize + 'px';
                                    ctxLegend.textAlign = 'right';
                                    ctxLegend.textBaseline = 'center';
                                    Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                                        ctxLegend.fillStyle = dataset.backgroundColor;
                                        const line = chart.getDatasetMeta(i).data;
                                        let firstPoint;
                                        for (let i = 0; i < line.length; i++) {
                                            if (!(line[i]._model.skip)){
                                                firstPoint = line[i];
                                                break;
                                            }
                                        }
                                        if (firstPoint) {
                                            ctxLegend.fillText(dataset.label, 140, firstPoint._model.y);
                                        }
                                    }), this);
                                }
                            }
                        }
                    }
                });
                console.log(parent.chartConfig);
            }
        }
    }

}
