/* eslint-disable max-len */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { DynamicFormComponent } from '../../../components/shared/form/containers/form/form.component';
import { DbService } from '../../../services/db/db.service';

import { Plant } from '../../../interfaces/plant';
import { Strain } from '../../../interfaces/strain';
import { Company } from '../../../interfaces/company';
import { GrowingMedium } from '../../../interfaces/growing-medium';
import { GrowingScenario } from '../../../interfaces/growing-scenario';
import { Pot } from '../../../interfaces/pot';
import { FieldConfig } from 'src/app/components/shared/form/models/field-config.interface';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  providers: [DatePipe]
})
export class PlantsDetailPage implements OnInit {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  public id: string;
  public page = 'plants';
	formDefinition: FieldConfig;;
	previousValid = false;

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
	  public router: Router,
    private datePipe: DatePipe
  ) {
    this.formDefinition = [
			{ name: 'idStrain', type: 'inputSelect', label: 'Strain', options: [], multiple: false, validation: [Validators.required], },
			{ name: 'generation', type: 'number', label: 'Generation', validation: [Validators.required], },
			{ name: 'dayStartGrow', type: 'date', label: 'Day Start Grow', validation: [Validators.required], },
			{ name: 'alerts', type: 'text', label: 'Alerts', },
			{ name: 'id', type: 'hidden', label: '', },
			{ name: 'idCompany', type: 'inputSelect', label: 'Company', options: [], multiple: false, validation: [Validators.required], },
			{ name: 'idGrowingMedium', type: 'inputSelect', label: 'Medium', options: [], multiple: false, validation: [Validators.required], },
      { name: 'idGrowingScenario', type: 'inputSelect', label: 'Scenario', options: [], multiple: false, validation: [Validators.required], },
			{ name: 'enabled', type: 'toggle', label: 'Enabled', },
			{ name: 'deleted', type: 'hidden', label: '', },
			{ name: 'lastUpdate', type: 'hidden', label: '', },
      { name: 'idPot', type: 'inputSelect', label: 'Pot', options: [], multiple: false, validation: [Validators.required], },

      { name: 'dayStartBloom', type: 'date', label: 'Day Start Bloom', },
      { name: 'dayHarvest', type: 'date', label: 'Day Harvest', },
      { name: 'dayTrimming', type: 'date', label: 'Day Trimming', },
      { name: 'daySecondTrimming', type: 'date', label: 'Day Second Trimming', },
      { name: 'yeld', type: 'number', label: 'Revenue', },

      { name: 'submit', type: 'button', label: 'Submit', },
		];
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.db.load().then(() => {
      this.previousValid = this.form.valid;
      this.form.changes.subscribe(() => {
        console.log(this.form)
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
    const companiesP: Promise<Array<Company>> = this.db.getItems('companies');
    const potsP: Promise<Array<Pot>> = this.db.getItems('pots');
    const strainsP: Promise<Array<Strain>> = this.db.getItems('strains');
    const gMediumP: Promise<Array<GrowingMedium>> = this.db.getItems('growing_mediums');
    const gMScenarioP: Promise<Array<GrowingScenario>> = this.db.getItems('growing_scenarios');
    Promise.all([ companiesP, strainsP, gMediumP, gMScenarioP, potsP]).then(([ companies, strains, gMedium, gScenario, pots]) => {
      this.formDefinition.find(el => el.name === 'idCompany').options = companies.sort((a, b) => a.name > b.name ? 1 : -1);
      this.formDefinition.find(el => el.name === 'idStrain').options = strains.sort((a, b) => a.name > b.name ? 1 : -1);
      this.formDefinition.find(el => el.name === 'idPot').options = pots.sort((a, b) => a.name > b.name ? 1 : -1);
      this.formDefinition.find(el => el.name === 'idGrowingMedium').options = gMedium;
      this.formDefinition.find(el => el.name === 'idGrowingScenario').options = gScenario;
      if(id){
        const itemP: Promise<Plant> = this.db.getItem(this.page, id);
        itemP.then((item: Plant) => {
          if(item){
            this.form.config.filter(el => el.type === 'date').map(el => {
              item[el.name] = this.datePipe.transform(item[el.name], 'yyyy-MM-dd');
            });
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
    this.save(value as Plant);
  }

	save(value: Plant){
    this.form.config.filter(el => el.type === 'date').map(el => {
      value[el.name] = new Date(value[el.name]).getTime();
    });

		this.db.putItem(this.page, value).then((result)=>{
		  this.router.navigate(['/pages/'+this.page]);
		});
	}

}
