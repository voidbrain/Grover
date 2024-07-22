import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ColorPickerPopoverPage } from './color-picker-popover.page';

const routes: Routes = [
  {
    path: '',
    component: ColorPickerPopoverPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ColorPickerPopoverPage]
})
export class ColorPickerPopoverPageModule {}
