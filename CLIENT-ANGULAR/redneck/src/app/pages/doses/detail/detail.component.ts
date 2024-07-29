/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicFormComponent } from '../../../components/shared/form/containers/form/form.component';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { Dose } from '../../../interfaces/dose';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/shared/chart/chart.component';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  IonMenuButton,
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
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';

@Component({
  selector: 'app-doses-detail',
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
    IonMenuButton,
    IonMenuToggle,
    IonRefresher,
    IonRefresherContent,
    IonReorder,
    IonReorderGroup,
    IonRow,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    DynamicFormComponent,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DosesDetailComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent | undefined;
  public id: any;
  public page = 'doses';
  formDefinition: any;

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
    public router: Router,
  ) {
    this.formDefinition = [
      { type: 'number', label: 'grow', name: 'grow', validation:[Validators.required] },
      { type: 'number', label: 'micro', name: 'micro', validation:[Validators.required] },
      { type: 'number', label: 'bloom', name: 'bloom', validation:[Validators.required] },
      { type: 'number', label: 'ripen', name: 'ripen', validation:[Validators.required] },
      { type: 'number', label: 'EC', name: 'EC', validation:[Validators.required] },
      { type: 'hidden', label: '', name: 'id' },
      { type: 'toggle', label: 'Enabled', name: 'enabled' },
      { type: 'hidden', label: '', name: 'deleted' },
      { type: 'hidden', label: '', name: 'lastUpdate' },
      { type: 'button', label: 'Submit', name: 'submit' },
    ];
    addIcons(ionIcons);
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.db
      .load()
      .then(() => {
        this.form.changes.subscribe(() => {
          this.form.setDisabled(
            'submit',
            !this.form.valid,
          );
        });
        this.getItem(+(this.route.snapshot.paramMap.get('id') as string));
      })
      .catch((err) => console.error(err));
  }

  goBack() {
    this.router.navigate([this.page]);
  }

  getItem(id: any) {
    if (id) {
      const itemP: Promise<Dose> = this.db.getItem(this.page, id);
      itemP.then((item: Dose) => {
        if (item) {
          this.form.setFormValues(item);
          this.form.setDisabled('submit', false);
        }
      });
    } else {
      this.form.setValue('enabled', 1);
      this.form.setValue('deleted', 0);
      this.form.setDisabled('submit', true);
    }
  }

  formSubmitted(value: { [name: string]: any }) {
    this.save(value as Dose);
  }

  save(value: any) {
    this.form.config
      .filter((el) => el.type === 'date')
      .map((el) => {
        value[el.name] = new Date(value[el.name]).getTime();
      });
    this.db.putItem(this.page, value).then(() => {
      this.router.navigate([this.page]);
    });
  }
}
