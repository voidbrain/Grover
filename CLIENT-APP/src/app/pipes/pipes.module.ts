import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './sanitize-html-pipe/sanitize-html-pipe.pipe';

@NgModule({
  	imports: [],
  	declarations: [ 
    	SanitizeHtmlPipe
  	],
  	exports: [
    	SanitizeHtmlPipe
  	]
})

export class PipesModule {}