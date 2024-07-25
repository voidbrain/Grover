/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/array-type */
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/shared/chart/chart.component';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicFormComponent } from '../../../components/shared/form/containers/form/form.component';
import {
  IonBadge,
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
import { Strain } from '../../../interfaces/strain';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';

@Component({
  selector: 'app-strains-detail',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    ChartComponent,
    IonBadge,
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
export class StrainsDetailComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent | undefined;
  public id: any;
  public page = 'strains';
  formDefinition: any;
  previousValid = false;

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
    public router: Router,
  ) {
    this.formDefinition = [
      {
        name: 'name',
        type: 'text',
        label: 'Name',
        validation: [Validators.required],
      },
      {
        name: 'lineage',
        type: 'inputSelect',
        label: 'Lineage',
        options: [],
        multiple: true,
      },
      {
        name: 'percentSativa',
        type: 'range',
        label: '% Sativa',
        min: 0,
        max: 100,
        step: '5',
        icon: 'sunny',
      },
      { name: 'id', type: 'hidden', label: '' },
      { name: 'enabled', type: 'toggle', label: 'Enabled' },
      { name: 'deleted', type: 'hidden', label: '' },
      { name: 'lastUpdate', type: 'hidden', label: '' },
      { name: 'submit', type: 'button', label: 'Submit' },
    ];
    addIcons(ionIcons);
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.db
      .load()
      .then(() => {
        this.previousValid = (this.form as DynamicFormComponent).valid;
        (this.form as DynamicFormComponent).changes.subscribe(() => {
          if (
            (this.form as DynamicFormComponent).valid !== this.previousValid
          ) {
            this.previousValid = (this.form as DynamicFormComponent).valid;
            (this.form as DynamicFormComponent).setDisabled(
              'submit',
              !this.previousValid,
            );
          }
        });
        this.getItem(+(this.route.snapshot.paramMap.get('id') as string));
      })
      .catch((err) => console.error(err));
  }

  goBack() {
    this.router.navigate(['/pages/' + this.page]);
  }

  getItem(id: any) {
    const strainsP: Promise<Array<Strain>> = this.db.getItems('strains');
    Promise.all([strainsP]).then(([strains]) => {
      this.formDefinition.find((el: any) => el.name === 'lineage').options =
        strains;
      if (id) {
        const itemP: Promise<Strain> = this.db.getItem(this.page, id);
        itemP.then((item: Strain) => {
          if (item) {
            (this.form as DynamicFormComponent).setFormValues(item);
            (this.form as DynamicFormComponent).setDisabled('submit', false);
          }
        });
      } else {
        (this.form as DynamicFormComponent).config
          .filter(
            (el) =>
              (el.type === 'date' || el.type === 'number') && !el.validation,
          )
          .map((el) => {
            (this.form as DynamicFormComponent).setDisabled(el.name, true);
          });
        (this.form as DynamicFormComponent).setValue('enabled', 1);
        (this.form as DynamicFormComponent).setValue('deleted', 0);
        (this.form as DynamicFormComponent).setDisabled('submit', true);
      }
    });
  }

  formSubmitted(value: { [name: string]: any }) {
    this.save(value as Strain);
  }

  save(value: any) {
    (this.form as DynamicFormComponent).config
      .filter((el) => el.type === 'date')
      .map((el: any) => {
        value[el.name] = new Date(value[el.name]).getTime();
      });
    value.lineage = value.lineage.toString();
    this.db.putItem(this.page, value).then(() => {
      this.router.navigate(['/pages/' + this.page]);
    });
  }
}
