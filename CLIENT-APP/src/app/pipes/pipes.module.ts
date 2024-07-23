import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './sanitize-html-pipe/sanitize-html-pipe.pipe';

@NgModule({
  	imports: [
    RouterLink, RouterOutlet, FormsModule, ReactiveFormsModule, ChartComponent,
    IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenu, IonMenuToggle, IonRefresher, IonRefresherContent, IonReorder, IonReorderGroup, IonRow, IonSelectOption, IonTitle, IonToolbar
  ],
  	declarations: [ 
    	SanitizeHtmlPipe
  	],
  	exports: [
    	SanitizeHtmlPipe
  	]
})

export class PipesModule {}
