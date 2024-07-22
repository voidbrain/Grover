import { Injectable, NgZone, Inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';

import tinycolor from 'tinycolor2'; 


export interface IonColor{
    key: string;
    value: string;
    friendlyName: string;
};

@Injectable({
    providedIn: 'root'
})
export class ColorService {

private ionPrefix : string = ".ion-color-";

public colorList : IonColor[] = [
    {key: "flame",                  value: "#e45a33", friendlyName: "Flame" },
    {key: "orange",                 value: "#fa761e", friendlyName: "Orange" },
    {key: "infrared",               value: "#ef486e", friendlyName: "Infrared" },
    {key: "male",                   value: "#4488ff", friendlyName: "Male Color" },
    {key: "female",                 value: "#ff44aa", friendlyName: "Female Color" },
    {key: "paleyellow",             value: "#ffd165", friendlyName: "Pale Yellow" },
    {key: "gargoylegas",            value: "#fde84e", friendlyName: "Gargoyle Gas" },
    {key: "androidgreen",           value: "#9ac53e", friendlyName: "Android Green" },
    {key: "carribeangreen",         value: "#05d59e", friendlyName: "Carribean Green" },
    {key: "bluejeans",              value: "#5bbfea", friendlyName: "Blue Jeans" },
    {key: "cyancornflower",         value: "#1089b1", friendlyName: "Cyan Cornflower" },
    {key: "warmblack",              value: "#06394a", friendlyName: "Warm Black" },
];


constructor(
    @Inject(DOCUMENT) private document: Document,
){
    this.colorList.forEach( c => this.addIonColor(c.key, c.value));
}

public getColorValue(colorKey:string):string{
    let idx = this.colorList.map( c=>c.key).indexOf(colorKey);
    return idx == -1 ? undefined : this.colorList[idx].value;
}


public addIonColor(name:string, baseColor:string){
	const namePattern = /^[a-zA-Z][\-_0-9A-Za-z]+$/;
	
    if(!namePattern.test(name)){
            throw new Error(`Invalid color name: ${name} should match /^[a-zA-Z][\-_0-9A-Za-z]$/` );
            return;
    }
	let color = new tinycolor(baseColor);
	
	if ( !color.isValid() ) {
		throw new Error(`Invalid color value: ${baseColor}`)
		return;
	}
	let hex = color.toString('hex6');
	let rgb = color.toRgb();
	let contrast = tinycolor( color.getBrightness() > 150 ? "#222" : "#eee" );
	let contrastRgb = contrast.toRgb();
	
	let css = 
    `${this.ionPrefix+name} {
        --ion-color-base: ${hex};
        --ion-color-base-rgb: ${rgb.r},${rgb.g},${rgb.b};
        --ion-color-contrast: ${contrast.toString('hex6')};
        --ion-color-contrast-rgb: ${contrastRgb.r},${contrastRgb.g},${contrastRgb.b};
        --ion-color-shade: ${color.darken().toString('hex6')};
        --ion-color-tint: ${color.lighten().toString('hex6')};
        }
    `
	//console.log(css);
	
	var docStyle = this.document.createElement('style');
	docStyle.type = 'text/css';
	docStyle.innerHTML = css;
	this.document.getElementsByTagName('head')[0].appendChild(docStyle);
}

// public enumerateIonColors() {
//   var sheet, sheets = document.styleSheets;
//   var rule, rules;
//   var classes = [];
//   var temp;

//   for (var i=0, iLen=sheets.length; i<iLen; i++) {
//     sheet = sheets[i];
//     rules = sheet.rules;
		
//     for (var j=0, jLen=rules.length; j<jLen; j++) {
//       rule = rules[j];

//       // Get the classes matching '.ion-color-*'
//       temp = rule.cssText.match(/\.ion-color-\w+/g);

//       if (temp) {
//         classes.push.apply(classes, temp);
//       }
//     }
//    }
//   // Return an array of the class and ID arrays
//   return classes.map( s => s.replace(this.ionPrefix,"")  );
// }



}