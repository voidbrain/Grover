import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
var SettingsService = /** @class */ (function () {
    function SettingsService() {
        this.appName = 'Grover/RedNeck';
        this.serverAddress = 'http://www.voidbrain.net/temp/grover/ajax/moduli/api';
        this.purposes = ['client', 'worker'];
        this.purpose = 0;
        this.datatables = ['calendars', 'doses', 'settings', 'mediums', 'scenarios', 'plants', 'companies', 'strains'];
    }
    SettingsService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [])
    ], SettingsService);
    return SettingsService;
}());
export { SettingsService };
//# sourceMappingURL=settings.service.js.map