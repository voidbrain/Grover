import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ChartComponent } from './chart/chart.component';
import { ReportComponent } from './report/report.component';
import { FormsModule }     from '@angular/forms';



@NgModule({
    declarations: [
        ChartComponent,
        ReportComponent
    ],
    exports: [
        ChartComponent,
        ReportComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule
    ]
})
export class ComponentsModule {}
