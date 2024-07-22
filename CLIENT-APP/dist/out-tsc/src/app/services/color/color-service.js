import * as tslib_1 from "tslib";
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import tinycolor from 'tinycolor2';
;
var ColorService = /** @class */ (function () {
    function ColorService(document) {
        var _this = this;
        this.document = document;
        this.ionPrefix = ".ion-color-";
        this.colorList = [
            { key: "flame", value: "#e45a33", friendlyName: "Flame" },
            { key: "orange", value: "#fa761e", friendlyName: "Orange" },
            { key: "infrared", value: "#ef486e", friendlyName: "Infrared" },
            { key: "male", value: "#4488ff", friendlyName: "Male Color" },
            { key: "female", value: "#ff44aa", friendlyName: "Female Color" },
            { key: "paleyellow", value: "#ffd165", friendlyName: "Pale Yellow" },
            { key: "gargoylegas", value: "#fde84e", friendlyName: "Gargoyle Gas" },
            { key: "androidgreen", value: "#9ac53e", friendlyName: "Android Green" },
            { key: "carribeangreen", value: "#05d59e", friendlyName: "Carribean Green" },
            { key: "bluejeans", value: "#5bbfea", friendlyName: "Blue Jeans" },
            { key: "cyancornflower", value: "#1089b1", friendlyName: "Cyan Cornflower" },
            { key: "warmblack", value: "#06394a", friendlyName: "Warm Black" },
        ];
        this.colorList.forEach(function (c) { return _this.addIonColor(c.key, c.value); });
    }
    ColorService.prototype.getColorValue = function (colorKey) {
        var idx = this.colorList.map(function (c) { return c.key; }).indexOf(colorKey);
        return idx == -1 ? undefined : this.colorList[idx].value;
    };
    ColorService.prototype.addIonColor = function (name, baseColor) {
        var namePattern = /^[a-zA-Z][\-_0-9A-Za-z]+$/;
        if (!namePattern.test(name)) {
            throw new Error("Invalid color name: " + name + " should match /^[a-zA-Z][-_0-9A-Za-z]$/");
            return;
        }
        var color = new tinycolor(baseColor);
        if (!color.isValid()) {
            throw new Error("Invalid color value: " + baseColor);
            return;
        }
        var hex = color.toString('hex6');
        var rgb = color.toRgb();
        var contrast = tinycolor(color.getBrightness() > 150 ? "#222" : "#eee");
        var contrastRgb = contrast.toRgb();
        var css = this.ionPrefix + name + " {\n        --ion-color-base: " + hex + ";\n        --ion-color-base-rgb: " + rgb.r + "," + rgb.g + "," + rgb.b + ";\n        --ion-color-contrast: " + contrast.toString('hex6') + ";\n        --ion-color-contrast-rgb: " + contrastRgb.r + "," + contrastRgb.g + "," + contrastRgb.b + ";\n        --ion-color-shade: " + color.darken().toString('hex6') + ";\n        --ion-color-tint: " + color.lighten().toString('hex6') + ";\n        }\n    ";
        //console.log(css);
        var docStyle = this.document.createElement('style');
        docStyle.type = 'text/css';
        docStyle.innerHTML = css;
        this.document.getElementsByTagName('head')[0].appendChild(docStyle);
    };
    ColorService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__param(0, Inject(DOCUMENT)),
        tslib_1.__metadata("design:paramtypes", [Document])
    ], ColorService);
    return ColorService;
}());
export { ColorService };
//# sourceMappingURL=color-service.js.map