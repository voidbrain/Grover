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
  name: 'convertToSentence',
})
export class convertToSentence implements PipeTransform {
  // *
  // * Takes a date value and returns a pretty string from current time, 
  // * for instance: "four hours ago" or "in eleven minutes".
   
  
  	transform(date, format) {
  		//moment.locale('it');
      let text = "";
      
        if (date >= 2){
          text = ""+Math.abs(date)+" weeks ago";
        } else if (0 < date && date < 2){
          text = "1 week ago";
        } else if ( date == 0){
          text = "This week";
        } else if ( 0 > date && date > -2 ){
          text = "In 1 week";
        } else if (date <= -2){
         text = "In "+Math.abs(date)+" weeks";
        }
        
	    return text;
	}
    //return moment(value).fromNow();
    //return value.toLowerCase();
 
}