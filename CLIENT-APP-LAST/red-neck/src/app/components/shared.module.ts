/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'angular2-chartjs';
import { TranslateModule } from '@ngx-translate/core';

import { CapitalizePipe, PluralPipe, LocalDatePipe, RoundPipe, TimingPipe, NumberWithCommasPipe, SecondstoTimePipe, HoursToDaysPipe, DateFormatPipe } from './../pipes';

import { ExpandableComponent } from '../components/shared/expandable/expandable';
import { DynamicFormModule } from '../components/shared/form/form.module';
import { ChartComponent } from '../components/shared/chart/chart.component';
import { RangeComponent } from '../components/shared/range/range.component';

import { DosesBarComponent } from './plants/detail-panel/doses-bar/doses-bar.component';
import { PhaseDetailComponent } from './plants/detail-panel/phase-details/phase-details.component';
import { ProgressBarComponent } from '../components/plants/progress-bar/progress-bar.component';
import { GrowingResultsComponent } from '../components/plants/growing-results/growing-results.component';
import { FilterBarComponent } from '../components/plants/filter-bar/filter-bar.component';
import { DetailPanelComponent } from '../components/plants/detail-panel/detail-panel.component';
import { LogPanelComponent } from './plants/detail-panel/log-panel/log-panel.component';
import { SchedulePanelComponent } from './plants/detail-panel/schedule-panel/schedule-panel.component';
import { ActionsPanelComponent } from './plants/detail-panel/actions-panel/actions-panel.component';

import { PanelChartComponent } from './plants/detail-panel/chart/chart.component';
import { PanelTableComponent } from './plants/detail-panel/table/table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const PIPES = [
  CapitalizePipe,
  PluralPipe,
  LocalDatePipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe,
  SecondstoTimePipe,
  HoursToDaysPipe,
  DateFormatPipe,
];

@NgModule({
  imports: [
    ChartModule,
    CommonModule,
    TranslateModule,
    DynamicFormModule,
    IonicModule,
    FormsModule,
    FontAwesomeModule,
  ],
  exports: [
    ...PIPES,
    TranslateModule,
    ProgressBarComponent,
    GrowingResultsComponent,
    FilterBarComponent,
    DetailPanelComponent,
    LogPanelComponent,
    SchedulePanelComponent,
    ActionsPanelComponent,
    PanelTableComponent,
    PanelTableComponent,
    ExpandableComponent,
    DosesBarComponent,
    ChartComponent,
    RangeComponent,
    DynamicFormModule,
    PhaseDetailComponent
  ],
  providers: [],
  declarations: [
    ...PIPES,
    ProgressBarComponent,
    GrowingResultsComponent,
    FilterBarComponent,
    DetailPanelComponent,
    LogPanelComponent,
    SchedulePanelComponent,
    ActionsPanelComponent,
    RangeComponent,
    PanelChartComponent,
    PanelTableComponent,
    ExpandableComponent,
    DosesBarComponent,
    ChartComponent,
    PhaseDetailComponent
  ],
})

export class SharedModule { }

