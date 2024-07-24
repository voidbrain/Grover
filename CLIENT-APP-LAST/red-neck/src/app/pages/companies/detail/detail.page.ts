/* eslint-disable max-len */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { DynamicFormComponent } from '../../../components/shared/form/containers/form/form.component';
import { DbService } from '../../../services/db/db.service';

import { Company } from '../../../interfaces/company';
import { Strain } from '../../../interfaces/strain';
import { GrowingMedium } from '../../../interfaces/growing-medium';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  providers: [DatePipe]
})
export class CompaniesDetailPage implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  public id: string;
  public page = 'companies';
	formDefinition: any;
	previousValid = false;
  pots;

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
	  public router: Router,
    private datePipe: DatePipe
  ) {
    this.formDefinition = [
			{ type: 'text', label: 'Name', name: 'name', validation: [Validators.required], },
      { type: 'hidden', label: '', name: 'id', },
      { type: 'toggle', label: 'Enabled', name: 'enabled', },
      { type: 'hidden', label: '', name: 'deleted', },
      { type: 'hidden', label: '', name: 'lastUpdate', },
      { type: 'button', label: 'Submit', name: 'submit', }
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
      const itemP: Promise<Company> = this.db.getItem(this.page, id);
      itemP.then((item: Company) => {
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
    this.save(value as Company);
  }

	save(value: Company){
    this.form.config.filter(el => el.type === 'date').map(el => {
      value[el.name] = new Date(value[el.name]).getTime();
    });

		this.db.putItem(this.page, value).then((result)=>{
		  this.router.navigate(['/pages/'+this.page]);
		});
	}

}
