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
import { Company } from '../../../interfaces/company';
import { Pot } from '../../../interfaces/pot';
import { DatePipe } from '@angular/common';
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
export class CompaniesDetailComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent | undefined;
  public id: any;
  public page = 'companies';
  formDefinition: any;
  previousValid = false;
  pots: Pot[] = [];

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
        this.getItem(this.route.snapshot.paramMap.get('id') as string);
      })
      .catch((err) => console.error(err));
  }

  goBack() {
    this.router.navigate(['/pages/' + this.page]);
  }

  getItem(id: any) {
    if (id) {
      const itemP: Promise<Company> = this.db.getItem(this.page, id);
      itemP.then((item: Company) => {
        if (item) {
          (this.form as DynamicFormComponent).setFormValues(item);
          (this.form as DynamicFormComponent).setDisabled('submit', false);
        }
      });
    } else {
      (this.form as DynamicFormComponent).setValue('enabled', 1);
      (this.form as DynamicFormComponent).setValue('deleted', 0);
      (this.form as DynamicFormComponent).setDisabled('submit', true);
    }
  }

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  formSubmitted(value: { [name: string]: any }) {
    this.save(value as Company);
  }

  save(value: any) {
    (this.form as DynamicFormComponent).config
      .filter((el: any) => el.type === 'date')
      .map((el: any) => {
        value[el.name] = new Date(value[el.name]).getTime();
      });

    this.db.putItem(this.page, value).then(() => {
      this.router.navigate(['/pages/' + this.page]);
    });
  }
}
