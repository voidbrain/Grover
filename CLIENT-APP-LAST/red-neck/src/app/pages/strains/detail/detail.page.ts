/* eslint-disable max-len */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DynamicFormComponent } from '../../../components/shared/form/containers/form/form.component';
import { DbService } from '../../../services/db/db.service';

import { Strain } from '../../../interfaces/strain';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class StrainsDetailPage implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  public id: string;
  public page = 'strains';
	formDefinition: any;
	previousValid = false;

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
	  public router: Router
  ) {
    this.formDefinition = [
			{ name: 'name', type: 'text', label: 'Name', validation: [Validators.required],	 },
			{ name: 'lineage', type: 'inputSelect', label: 'Lineage', options: [],  multiple: true, },
			{ name: 'percentSativa', type: 'range', label: '% Sativa', min:0, max:100, step:'5', icon:'sunny' },
			{ name: 'id', type: 'hidden', label: '', },
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
    const strainsP: Promise<Array<Strain>> = this.db.getItems('strains');
    Promise.all([strainsP]).then(([strains]) => {
      this.formDefinition.find(el => el.name === 'lineage').options = strains;
      if(id){
        const itemP: Promise<Strain> = this.db.getItem(this.page, id);
        itemP.then((item: Strain) => {
          if(item){
            this.form.setFormValues(item);
            this.form.setDisabled('submit', false);
          }
        });
      }else{
        this.form.config.filter(el => (el.type === 'date' || el.type === 'number' ) && !el.validation).map(el => {
          this.form.setDisabled(el.name, true);
        });
        this.form.setValue('enabled', 1);
        this.form.setValue('deleted', 0);
        this.form.setDisabled('submit', true);
      }
    });
	}

  formSubmitted(value: {[name: string]: any}) {
    this.save(value as Strain);
  }

	save(value: Strain){
    this.form.config.filter(el => el.type === 'date').map(el => {
      value[el.name] = new Date(value[el.name]).getTime();
    });
    value.lineage = value.lineage.toString();
		this.db.putItem(this.page, value).then((result)=>{
      this.router.navigate(['/pages/'+this.page]);
		});
	}

}
