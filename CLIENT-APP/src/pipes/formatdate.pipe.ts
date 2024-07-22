import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import 'moment/locale/it';

/**
 * Generated class for the FormatDatePipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'formatDatePipe',
})
export class formatDatePipe implements PipeTransform {
  // *
  // * Takes a date value and returns a pretty string from current time, 
  // * for instance: "four hours ago" or "in eleven minutes".
   
  
  	transform(date, format) {
  		moment.locale('it');
	    return moment(moment.unix(date)).format(format);
	}
    //return moment(value).fromNow();
    //return value.toLowerCase();
 
}