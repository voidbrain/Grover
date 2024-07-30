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

import { Calendar } from '../../../interfaces/calendar';
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
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-calendar-detail',
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
  providers: [DatePipe]
})
export class CalendarsDetailComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent | undefined;
  public id: any;
  public page = 'calendars';
  formDefinition: any;
  previousValid = false;

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
    public router: Router,
    private datePipe: DatePipe,
  ) {
    this.formDefinition = [
      {
        name: 'week_n',
        type: 'text',
        label: 'Week n',
        validation: [Validators.required],
      },
      { name: 'id', type: 'hidden', label: '' },
      {
        name: 'id_dose',
        type: 'inputSelect',
        label: 'Dose',
        options: [],
        multiple: false,
        validation: [Validators.required],
      },
      { name: 'enabled', type: 'toggle', label: 'Enabled' },
      { name: 'deleted', type: 'hidden', label: '' },
      { name: 'lastUpdate', type: 'hidden', label: '' },
      { name: 'submit', type: 'button', label: 'Submit' },
    ];
    addIcons(ionIcons);
  }

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    const run = await this.db.load()
      
        this.form.changes.subscribe(() => {
          if (
            this.form.valid
          ) {
            this.previousValid = this.form.valid;
            this.form.setDisabled(
              'submit',
              this.form.valid,
            );
          }
        
        this.getItem(this.route.snapshot.paramMap.get('id') as string);
      })
      run.catch((err) => console.error(err));
  }

  goBack() {
    this.router.navigate([this.page]);
  }

  async getItem(id: any) {
    if (id) {
      const item: Calendar = await this.db.getItem(this.page, id);
     
        if (item) {
          this.form.setFormValues(item);
          this.form.setDisabled('submit', false);
        }
      
    } else {
      this.form.setValue('enabled', 1);
      this.form.setValue('deleted', 0);
      this.form.setDisabled('submit', true);
    }
  }

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  formSubmitted(value: { [name: string]: any }) {
    this.save(value as Calendar);
  }

  async save(value: any) {
    this.form.config
      .filter((el) => el.type === 'date')
      .map((el: any) => {
        value[el.name] = new Date(value[el.name]).getTime();
      });
    await this.db.putItem(this.page, value);
    this.router.navigate([this.page]);
    
  }
}
