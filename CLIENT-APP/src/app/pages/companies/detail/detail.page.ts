import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router  } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { NetworkService } from '../../../services/network/network.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.page.html',
    styleUrls: ['./detail.page.scss'],
})

export class DetailPage implements OnInit {
    page = 'companies';

    isOnline = false;
    isReadyToSave = false;
    showForm = true;
    form: FormGroup;

    constructor(
        public db: DbService,
        public network: NetworkService,
        public loadingController: LoadingController,
        private route: ActivatedRoute,
        public router: Router,
        private formBuilder: FormBuilder
    ) {
        this.form = formBuilder.group({
            name						: ['', Validators.required],
            id							: [''],
            enabled						: [''],
            deleted						: [''],
            lastUpdate					: [''],
        }, {});

        this.isOnline = navigator.onLine;
        this.form.valueChanges.subscribe((v) => {
            this.isReadyToSave = this.isOnline && this.form.valid;
        });
    }

    ngOnInit() {}

    ionViewWillEnter() {
        this.db.load().then(() => {
            const id = this.route.snapshot.paramMap.get('id');
            this.getItem(parseInt(id)); 
        }).catch(err => console.error(err));
    }

    goBack(){
        this.router.navigate([this.page]);
    }

    getItem(id) {
        if (id){
            this.db.getItem(this.page, id).then(item => {
                this.form.patchValue(item, {emitEvent: true});
            })
        }
    }

    addConnectivityListeners(): void {
        this.network.watchOnline().subscribe(() => {
            console.log('online')
            this.isOnline = true;
            this.isReadyToSave = this.form.valid;
        });

        this.network.watchOffline().subscribe(() => {
            console.log('offline')
            this.isOnline = false;
            this.isReadyToSave = false;
        });
    }

    saveForm(){
        const saveItem = Array(); 
        saveItem.push(this.form.value)
        this.db.putItems(this.page, saveItem).then((result) => {
            this.router.navigate([this.page]);
        })
    }
}
