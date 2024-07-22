import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

import { SessionService } from '../services/session/session.service';
import { SettingsService } from '../services/settings/settings.service';

@Pipe({
    name: 'DateFormatPipe',
})
export class DateFormatPipe implements PipeTransform {
  localeId;

  constructor(
    private translate: TranslateService,
    private session: SessionService,
    private settings: SettingsService,
  ) {}

  transform(value: string) {
    const locales = this.settings.getLocales();
    let l = locales.find(el => el === navigator.language);
    l = l ?? locales[0];
    const datePipe = new DatePipe(l);
    return datePipe.transform(value, 'short');
  }
}
