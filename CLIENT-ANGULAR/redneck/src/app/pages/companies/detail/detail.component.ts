import { Component, ViewChild, OnInit } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { DynamicFormComponent } from '../../../components/shared/form/containers/form/form.component';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
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
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  IonReorder,
  IonReorderGroup,
  IonRow,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { CompanyInterface } from '../../../interfaces/company';
import { PotInterface } from '../../../interfaces/pot';
import { DatePipe } from '@angular/common';
import { FieldConfig } from '../../../components/shared/form/models/field-config.interface';
@Component({
  selector: 'app-companies-detail',
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
  providers: [DatePipe],
})
export class CompaniesDetailComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent | undefined;
  public id: number;
  public page = 'companies';
  formDefinition: FieldConfig;
  pots: PotInterface[] = [];

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
    public router: Router,
    private datePipe: DatePipe,
  ) {
    this.formDefinition = [
      {
        type: 'text',
        label: 'Name',
        name: 'name',
        validation: [Validators.required],
      },
      { type: 'hidden', label: '', name: 'id' },
      { type: 'toggle', label: 'Enabled', name: 'enabled' },
      { type: 'hidden', label: '', name: 'deleted' },
      { type: 'hidden', label: '', name: 'lastUpdate' },
      { type: 'button', label: 'Submit', name: 'submit' },
    ];
    addIcons(ionIcons);
  }

  async ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');
    await this.db.load();
    this.form.changes.subscribe(() => {
      this.form.setDisabled('submit', !this.form.valid);
    });
    this.getItem(this.route.snapshot.paramMap.get('id') as string);
  }

  goBack() {
    this.router.navigate([this.page]);
  }

  async getItem(id: string) {
    if (id) {
      const item: CompanyInterface = await this.db.getItem(this.page, id);

      if (item) {
        this.form.setFormValues(item);
        this.form.setDisabled('submit', true);
      }
    } else {
      this.form.setValue('enabled', 1);
      this.form.setValue('deleted', 0);
      this.form.setDisabled('submit', true);
    }
  }

  formSubmitted(value: CompanyInterface) {
    this.save(value);
  }

  async save(value: CompanyInterface) {
    this.form.config
      .filter((el: FieldConfig) => el.type === 'date')
      .map((el: FieldConfig) => {
        value[el.name] = new Date(value[el.name]).getTime();
      });

    await this.db.putItem(this.page, value);
    this.router.navigate([this.page]);
  }
}
