import { Component, OnInit, ViewChild } from '@angular/core';
import {IonList, NavParams, PopoverController} from '@ionic/angular';
import {IonColor, ColorService} from '../../services/color/color-service';

@Component({
    selector: 'app-color-picker-popover',
    templateUrl: './color-picker-popover.page.html',
    styleUrls: ['./color-picker-popover.page.scss'],
})
export class ColorPickerPopoverPage implements OnInit {

    @ViewChild(IonList) list: IonList;

    private currentColor: IonColor;

    constructor( 
        public colorService: ColorService,
        private navParams:NavParams,
        private popCtrl:PopoverController
    ) { }

    ngOnInit() {
    this.currentColor = this.navParams.get('color');
    }

    closePopover() {
        this.popCtrl.getTop().then( p => p.dismiss(this.currentColor) ) 
    }


    selectColor(idx:number) {
        this.currentColor = this.colorService.colorList[idx];
        this.closePopover();
        // console.log(`Selected: ${idx} from ColorPickerPopoverPage`)
    }
}
