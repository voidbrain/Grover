import { Component, OnInit } from '@angular/core';
import { DbService } from '../../services/db/db.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
    private language: string = this.translateService.currentLang;
    private someProperty: string = '';

	constructor(
  		public db: DbService,
        private translateService: TranslateService
  	) { }

	ngOnInit() {}
    
    ionViewWillEnter() {
        this.db.load()
            .then((result) => {
        }).catch(err => console.error(err));
    }


    languageChange() {
        this.translateService.use(this.language);
    }

}
