import * as tslib_1 from "tslib";
import { Component, Input, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Chart } from 'chart.js';
var ChartComponent = /** @class */ (function () {
    function ChartComponent(renderer) {
        this.renderer = renderer;
    }
    ChartComponent.prototype.ngOnInit = function () { };
    ChartComponent.prototype.ngOnChanges = function (changes) {
        var parent = this;
        console.log(changes)
        if (changes.chartConfig.currentValue.data != null) {
            var chart_1 = new Chart(this.chart.nativeElement.getContext('2d'), {
                type: parent.chartConfig.type,
                data: parent.chartConfig.data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    title: { display: false },
                    legend: { display: false },
                    tooltips: { enabled: false },
                    scales: {
                        yAxes: [{ display: parent.chartConfig.y.show, stacked: parent.chartConfig.y.stacked, ticks: { beginAtZero: true } }],
                        xAxes: [{ display: parent.chartConfig.x.show, stacked: parent.chartConfig.x.stacked, ticks: { beginAtZero: true } }]
                    },
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 20,
                            bottom: 0
                        }
                    },
                    events: [],
                    animation: {
                        onComplete: function () {
                            if (parent.chartConfig.showValue) {
                                var ctx_1 = this.chart.ctx;
                                ctx_1.fillStyle = '#000';
                                ctx_1.fontSize = parent.chartConfig.labelsFontSize + 'px';
                                ctx_1.textAlign = 'center';
                                ctx_1.textBaseline = 'center';
                                Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                                    var meta = chart_1.controller.getDatasetMeta(i);
                                    Chart.helpers.each(meta.data.forEach(function (element, index) {
                                        var data = dataset.data[index];
                                        ctx_1.fillText(data, element._model.x - 2, element._model.y - 10);
                                    }), this);
                                }), this);
                            }
                        }
                    }
                }
            });
        }
    };
    tslib_1.__decorate([
        ViewChild('chart', { read: ElementRef }),
        tslib_1.__metadata("design:type", Object)
    ], ChartComponent.prototype, "chart", void 0);
    tslib_1.__decorate([
        Input('chartConfig'),
        tslib_1.__metadata("design:type", Object)
    ], ChartComponent.prototype, "chartConfig", void 0);
    ChartComponent = tslib_1.__decorate([
        Component({
            selector: 'chart',
            templateUrl: './chart.component.html',
            styleUrls: ['./chart.component.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [Renderer])
    ], ChartComponent);
    return ChartComponent;
}());
export { ChartComponent };
//# sourceMappingURL=chart.component.js.map
