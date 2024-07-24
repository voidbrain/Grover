/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */

import { Injectable } from '@angular/core';
import { registerLocaleData } from '@angular/common';
@Injectable({ providedIn: 'root' })
export class SessionService {

    private _locale: string;

    set locale(value: string) {
        this._locale = value;
    }
    get locale(): string {
        return this._locale || 'en-US';
    }

    registerCulture(culture: string) {
        if (!culture) {
            return;
        }
        this.locale = culture;

        import(
          `node_modules/@angular/common/locales/${this.locale}.js`
          ).then(module => {
            console.log(this.locale);
            registerLocaleData(module.default);

          });
    }
}
