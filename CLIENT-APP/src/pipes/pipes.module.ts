import { NgModule } from '@angular/core';
import { formatDatePipe } from './formatdate.pipe';
import { countTimeFromDatePipe } from './counttimefromdate.pipe';
import { addToDatePipe } from './addtodate.pipe';
import { convertToSentence } from './converttosentence.pipe';

@NgModule({
    declarations: [
        formatDatePipe,
        countTimeFromDatePipe,
        addToDatePipe,
        convertToSentence
    ],
    imports: [],
    exports: [
        formatDatePipe,
        countTimeFromDatePipe,
        addToDatePipe,
        convertToSentence
    ],
    providers: []
})
export class PipesModule { }