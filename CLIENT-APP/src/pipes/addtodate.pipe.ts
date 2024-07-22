import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

/**
 * Generated class for the MomentjsPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'addToDatePipe',
})
export class addToDatePipe implements PipeTransform {
  // *
  // * Takes a date value and returns a pretty string from current time, 
  // * for instance: "four hours ago" or "in eleven minutes".
   
  
    transform(date, add_tot, add_unit) {
      let nd = moment.unix(parseInt(date)).add(add_tot,add_unit).unix();
      return nd;
  }
    //return moment(value).fromNow();
    //return value.toLowerCase();
 
}