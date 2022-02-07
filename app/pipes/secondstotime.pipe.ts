import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'SecondstoTimePipe' })
export class SecondstoTimePipe implements PipeTransform {
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return minutes.toString().padStart(1, '0') + 'm ' +
        (Math.round((value - minutes * 60)*1)/1).toString().padStart(2, '0') + 's';
  }
}
