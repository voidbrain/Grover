import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { DbService } from '../../../services/db/db.service';
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

import { Company } from '../../../interfaces/company';
import { Strain } from '../../../interfaces/strain';
import { GrowingScenario } from '../../../interfaces/growing-scenario';
import { GrowingMedium } from '../../../interfaces/growing-medium';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { Plant } from '../../../interfaces/plant';
import { Pot } from '../../../interfaces/pot';
import { DynamicFormComponent } from '../../../components/shared/form/containers/form/form.component';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { FieldConfig } from '../../../components/shared/form/models/field-config.interface';

@Component({
  selector: 'app-plants-detail',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
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
  providers: [CommonModule, DatePipe, JsonPipe],
})
export class PlantsDetailComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  public id: number;
  public page = 'plants';
  formDefinition: FieldConfig;

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
    public router: Router,
    private datePipe: DatePipe,
  ) {
    this.formDefinition = [
      {
        name: 'idStrain',
        type: 'inputSelect',
        label: 'Strain',
        options: [],
        multiple: false,
        validation: [Validators.required],
      },
      {
        name: 'generation',
        type: 'number',
        label: 'Generation',
        validation: [Validators.required],
      },
      {
        name: 'dayStartGrow',
        type: 'date',
        label: 'Day Start Grow',
        validation: [Validators.required],
      },
      { name: 'alerts', type: 'text', label: 'Alerts' },
      { name: 'id', type: 'hidden', label: '' },
      {
        name: 'idCompany',
        type: 'inputSelect',
        label: 'Company',
        options: [],
        multiple: false,
        validation: [Validators.required],
      },
      {
        name: 'idGrowingMedium',
        type: 'inputSelect',
        label: 'Medium',
        options: [],
        multiple: false,
        validation: [Validators.required],
      },
      {
        name: 'idGrowingScenario',
        type: 'inputSelect',
        label: 'Scenario',
        options: [],
        multiple: false,
        validation: [Validators.required],
      },
      { name: 'enabled', type: 'toggle', label: 'Enabled' },
      { name: 'deleted', type: 'hidden', label: '' },
      { name: 'lastUpdate', type: 'hidden', label: '' },
      {
        name: 'idPot',
        type: 'inputSelect',
        label: 'Pot',
        options: [],
        multiple: false,
        validation: [Validators.required],
      },

      { name: 'dayStartBloom', type: 'date', label: 'Day Start Bloom' },
      { name: 'dayHarvest', type: 'date', label: 'Day Harvest' },
      { name: 'dayTrimming', type: 'date', label: 'Day Trimming' },
      { name: 'daySecondTrimming', type: 'date', label: 'Day Second Trimming' },
      { name: 'yeld', type: 'number', label: 'Revenue' },

      { name: 'submit', type: 'button', label: 'Submit' },
    ];
    addIcons(ionIcons);
  }

  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');

    this.db.load();

    this.form.changes.subscribe(() => {
      this.form.setDisabled('submit', !this.form.valid);
    });
    this.getItem(+this.route.snapshot.paramMap.get('id'));
  }

  goBack() {
    this.router.navigate([this.page]);
  }

  async getItem(id) {
    const companies: Company[] = await this.db.getItems('companies');
    const pots: Pot[] = await this.db.getItems('pots');
    const strains: Strain[] = await this.db.getItems('strains');
    const gMedium: GrowingMedium[] = await this.db.getItems('growing_mediums');
    const gScenario: GrowingScenario[] =
      await this.db.getItems('growing_scenarios');

    this.formDefinition.find((el) => el.name === 'idCompany').options =
      companies.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.formDefinition.find((el) => el.name === 'idStrain').options =
      strains.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.formDefinition.find((el) => el.name === 'idPot').options = pots.sort(
      (a, b) => (a.name > b.name ? 1 : -1),
    );
    this.formDefinition.find((el) => el.name === 'idGrowingMedium').options =
      gMedium;
    this.formDefinition.find((el) => el.name === 'idGrowingScenario').options =
      gScenario;
    if (id) {
      const item: Plant = await this.db.getItem(this.page, id);

      if (item) {
        this.form.config
          .filter((el) => el.type === 'date')
          .map((el) => {
            item[el.name] = this.datePipe.transform(
              item[el.name],
              'yyyy-MM-dd',
            );
          });
        this.form.setFormValues(item);
        this.form.setDisabled('submit', true);
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

  formSubmitted(value: Plant) {
    this.save(value);
  }

  async save(value: Plant) {
    this.form.config
      .filter((el) => el.type === 'date')
      .map((el) => {
        value[el.name] = new Date(value[el.name]).getTime();
      });

    await this.db.putItem(this.page, value);
    this.router.navigate([this.page]);
  }
}
