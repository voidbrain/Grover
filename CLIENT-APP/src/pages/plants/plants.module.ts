import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { PipesModule } from "../../pipes/pipes.module";
import { PlantsPage } from './plants';
//import { ProgressBarComponent } from '../../components/progress-bar/progress-bar';

@NgModule({
  declarations: [
    PlantsPage,
    //ProgressBarComponent
    //DetailComponent

  ],
  imports: [
    IonicPageModule.forChild(PlantsPage),
    TranslateModule.forChild(),
    PipesModule
  ],
  exports: [
    PlantsPage,
    //DetailComponent
  ]
})
export class PlantsModule { }
