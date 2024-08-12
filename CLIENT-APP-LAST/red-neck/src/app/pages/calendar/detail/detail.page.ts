/* eslint-disable max-len */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { DynamicFormComponent } from '../../../components/shared/form/containers/form/form.component';
import { DbService } from '../../../services/db/db.service';

import { Calendar } from '../../../interfaces/calendar';
import { FieldConfig } from 'src/app/components/shared/form/models/field-config.interface';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  providers: [DatePipe]
})
export class CalendarsDetailPage implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  public id: string;
  public page = 'calendars';
	formDefinition: FieldConfig;;
	previousValid = false;

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
	  public router: Router,
    private datePipe: DatePipe
  ) {
    this.formDefinition = [
      { name: 'week_n', type: 'text', label: 'Week n', validation: [Validators.required],},
      { name: 'id',  type: 'hidden', label: '', },
      { name: 'id_dose', type: 'inputSelect', label: 'Dose',  options: [], multiple: false, validation: [Validators.required], },
      { name: 'enabled', type: 'toggle', label: 'Enabled', },
      { name: 'deleted', type: 'hidden', label: '', },
      { name: 'lastUpdate', type: 'hidden', label: '', },
      { name: 'submit', type: 'button', label: 'Submit', }
    ];
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.db.load().then(() => {
      this.previousValid = this.form.valid;
      this.form.changes.subscribe(() => {
        if (this.form.valid !== this.previousValid) {
          this.previousValid = this.form.valid;
          this.form.setDisabled('submit', !this.previousValid);
          }
      });
      this.getItem(+(this.route.snapshot.paramMap.get('id')));
      }).catch(err => console.error(err));
  }

  goBack(){
    this.router.navigate(['/pages/'+this.page]);
  }

  getItem(id) {
    if(id){
      const itemP: Promise<Calendar> = this.db.getItem(this.page, id);
      itemP.then((item: Calendar) => {
        if(item){
          this.form.setFormValues(item);
          this.form.setDisabled('submit', false);
        }
      });
    }else{
      this.form.setValue('enabled', 1);
      this.form.setValue('deleted', 0);
      this.form.setDisabled('submit', true);
    }
	}

  formSubmitted(value: {[name: string]: any}) {
    this.save(value as Calendar);
  }

	save(value: Calendar){
    this.form.config.filter(el => el.type === 'date').map(el => {
      value[el.name] = new Date(value[el.name]).getTime();
    });
		this.db.putItem(this.page, value).then((result)=>{
		  this.router.navigate(['/pages/'+this.page]);
		});
	}

}
