import { Component, OnInit, ViewChildren } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DbService } from '../../../services/db/db.service';

@Component({
	selector: 'app-master',
	templateUrl: './master.page.html',
	styleUrls: ['./master.page.scss'],
})
export class MasterPage implements OnInit {
    @ViewChildren('slidingItem') private slidingItem;
	items: any;
    table: string = 'companies';

  	constructor(
  		public db: DbService,
    	public loadingController: LoadingController,
    	public router: Router
  	) { }

  	ngOnInit() {}

	ionViewWillEnter() {
        console.info('[PAGE]: Start');
        
        this.db.load().then(() => { 
            let forceLoading = true;
            this.db.initService(forceLoading).then(() => { 
                this.getItems(); 
            })
        }).catch(err => console.error(err));
	}

	getItems() {
		this.db.getItems(this.table).then((items) => {
			this.items = items;
            console.info('[PAGE]: Ready');
		});
	}

    deleteItem(item) {
        this.slidingItem._results.map((el) =>{ el.closeOpened(); });
        this.db.deleteItem(this.table, item).then((result) => {
            this.getItems()
        });
    }

 	showDetail(item) {
        this.slidingItem._results.map((el) =>{ el.closeOpened(); });
        
        this.router.navigate([this.table+'/edit', JSON.stringify(item.id)]);
        
  	}

    doRefresh(refresher) {
        this.slidingItem._results.map((el) =>{ el.closeOpened(); });
        let forceLoading = true;
        this.db.initService(forceLoading)
            .then(() => {
                this.getItems();
                refresher.target.complete();
            })
            .catch(err => console.error(err));
    }
}
