import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './sanitize-html-pipe/sanitize-html-pipe.pipe';
var PipesModule = /** @class */ (function () {
    function PipesModule() {
    }
    PipesModule = tslib_1.__decorate([
        NgModule({
            imports: [],
            declarations: [
                SanitizeHtmlPipe
            ],
            exports: [
                SanitizeHtmlPipe
            ]
        })
    ], PipesModule);
    return PipesModule;
}());
export { PipesModule };
//# sourceMappingURL=pipes.module.js.map