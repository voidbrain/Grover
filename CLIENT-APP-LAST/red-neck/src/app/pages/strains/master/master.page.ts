/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import { Component, OnInit, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DbService } from '../../../services/db/db.service';

import { Strain } from '../../../interfaces/strain';

@Component({
  selector: 'app-master',
  templateUrl: './master.page.html',
  styleUrls: ['./master.page.scss'],
})
export class StrainsMasterPage implements OnInit {
  @ViewChildren('slidingItem') private slidingItem;
  public id: string;
  items: Array<Strain>;
  page = 'strains';
  debug = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private db: DbService,
    private router: Router
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

	ionViewWillEnter() {
    if(this.debug){console.info('[PAGE]: Start');}
    this.db.load()
      .then(() => { this.getItems(); })
      .catch(err => console.error(err));
	}

	getItems() {
    const itemsP: Promise<Array<Strain>> = this.db.getItems(this.page);
    const strainsP: Promise<Array<Strain>> = this.db.getItems('strains');
    Promise.all([itemsP, strainsP]).then(([items, strains]) => {
      this.items = items.sort((a, b) => a.name > b.name ? 1 : -1);
      if(this.debug){console.info('[PAGE]: Ready');}
		});
	}

  deleteItem(item) {
    this.slidingItem._results.map((el) =>{ el.closeOpened(); });
    this.db.deleteItem(this.page, item).then(() => {
      this.getItems();
    });
  }

 	showDetail(item) {
    this.slidingItem._results.map((el) =>{ el.closeOpened(); });
    this.router.navigate(['/pages/'+this.page+'/edit', JSON.stringify(item.id)]);
  }

  doRefresh(refresher) {
    this.slidingItem._results.map((el) =>{ el.closeOpened(); });
    const forceLoading = true;
    this.db.initService(forceLoading)
      .then(() => {
        this.getItems();
        refresher.target.complete();
      })
      .catch(err => console.error(err));
  }

}
