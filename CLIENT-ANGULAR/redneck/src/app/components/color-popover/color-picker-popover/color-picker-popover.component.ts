import { Component, OnInit, ViewChild } from '@angular/core';
import { IonColor, ColorService } from '../../../services/color/color-service.service';
import { IonList, NavParams, PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-color-picker-popover',
  templateUrl: './color-picker-popover.component.html',
  styleUrls: ['./color-picker-popover.component.scss'],
  providers:[IonList, NavParams, PopoverController],
  standalone: true,
})
export class ColorPickerPopoverComponent {

  @ViewChild(IonList) list: IonList|null = null;

    private currentColor: IonColor|null = null;

  constructor(
    public colorService: ColorService,
    private navParams:NavParams,
    private popCtrl:PopoverController
  ) {
    this.init();
  }

  init(){
    this.currentColor = this.navParams.get('color');
  }

  closePopover() {
    this.popCtrl.getTop().then((p: any) => p.dismiss(this.currentColor) )
  }

  selectColor(idx:number) {
      this.currentColor = this.colorService.colorList[idx];
      this.closePopover();
  }
}
