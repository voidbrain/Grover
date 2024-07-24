import { Component } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { NetworkService } from '../../../services/network/network.service';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { ChartComponent } from '../../../components/shared/chart/chart.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  IonReorder,
  IonReorderGroup,
  IonRow,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    ChartComponent,
    IonButton,
    IonButtons,
    IonCard,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRefresher,
    IonRefresherContent,
    IonReorder,
    IonReorderGroup,
    IonRow,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class CompaniesDetailComponent {
  page = 'companies';

  isOnline = false;
  isReadyToSave = false;
  showForm = true;
  form: FormGroup = new FormGroup({});

  constructor(
    private db: DbService,
    private network: NetworkService,
    private loadingController: LoadingController,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    this.init();
    addIcons(ionIcons);
  }

  init() {
    this.form = this.formBuilder.group(
      {
        name: ['', Validators.required],
        id: [''],
        enabled: [''],
        deleted: [''],
        lastUpdate: [''],
      },
      {},
    );

    this.isOnline = navigator.onLine;
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.isOnline && this.form.valid;
    });

    this.db
      .load()
      .then(() => {
        const id: any = this.route.snapshot.paramMap.get('id');
        this.getItem(parseInt(id));
      })
      .catch((err) => console.error(err));
  }

  goBack() {
    this.router.navigate([this.page]);
  }

  getItem(id: any) {
    if (id) {
      this.db.getItem(this.page, id).then((item) => {
        this.form.patchValue(item, { emitEvent: true });
      });
    }
  }

  addConnectivityListeners(): void {
    this.network.watchOnline().subscribe(() => {
      console.log('online');
      this.isOnline = true;
      this.isReadyToSave = this.form.valid;
    });

    this.network.watchOffline().subscribe(() => {
      console.log('offline');
      this.isOnline = false;
      this.isReadyToSave = false;
    });
  }

  saveForm() {
    const saveItem = Array();
    saveItem.push(this.form.value);
    this.db.putItems(this.page, saveItem).then((result) => {
      this.router.navigate([this.page]);
    });
  }
}
