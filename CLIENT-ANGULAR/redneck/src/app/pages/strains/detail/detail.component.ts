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
import { FieldConfig } from '../../../components/shared/form/models/field-config.interface';

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
  public id: number;
  public page = 'strains';
  formDefinition: FieldConfig;

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

  async ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');

    await this.db.load();

    this.form.changes.subscribe(() => {
      this.form.setDisabled('submit', !this.form.valid);
    });
    this.getItem(+(this.route.snapshot.paramMap.get('id') as string));
  }

  goBack() {
    this.router.navigate([this.page]);
  }

  async getItem(id: number) {
    const strains: Strain[] = await this.db.getItems('strains') as Strain[];

    this.formDefinition.find((el: FieldConfig) => el.name === 'lineage')["options"] = strains;
    if (id) {
      const item: Strain = await this.db.getItem(this.page, id);

      if (item) {
        this.form.setFormValues(item);
        this.form.setDisabled('submit', true);
        console.log('ok', item);
      } else {
        console.log('else');
      }
    } else {
      this.form.config
        .filter(
          (el) =>
            (el.type === 'date' || el.type === 'number') && !el.validation,
        )
        .map((el) => {
          this.form.setDisabled(el.name, true);
        });
      this.form.setValue('enabled', 1);
      this.form.setValue('deleted', 0);
      this.form.setDisabled('submit', true);
    }
  }

  formSubmitted(value: Strain) {
    this.save(value);
  }

  async save(value: Strain) {
    this.form.config
      .filter((el) => el.type === 'date')
      .map((el: FieldConfig) => {
        value[el.name] = new Date(value[el.name]).getTime();
      });
    value.lineage = value.lineage.toString();
    await this.db.putItem(this.page, value);
    this.router.navigate([this.page]);
  }
}
