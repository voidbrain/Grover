import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../../pipes/pipes.module';
import { DetailPage } from './detail.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [{ path: '', component: DetailPage }];

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        RouterModule.forChild(routes),
        PipesModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild()
    ],
    declarations: [DetailPage]
})

export class DetailPageModule {}
