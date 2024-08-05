import { Component, Input, OnChanges } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';
import { Dose } from '../../../../interfaces/dose';
import { SanitizeHtmlPipe } from '../../../../pipes/sanitize-html/sanitize-html.pipe';

@Component({
  selector: 'app-doses-bar-horizontal',
  templateUrl: './doses-bar-horizontal.component.html',
  standalone: true,
  imports: [IonCol, IonGrid, IonRow, NgStyle, SanitizeHtmlPipe],
  styleUrls: ['./doses-bar-horizontal.component.scss'],
})
export class DosesBarHorizontalComponent implements OnChanges {
  @Input() dose!: Dose;
  tot!: number;
  styleDoses = {};
  stylePhDown = {};
  styleWater = {};

  ngOnChanges() {
    if (this.dose && this.dose !== undefined) {
      this.setup();
    }
  }

  setup() {
    const tot =
      this.dose?.grow + this.dose.micro + this.dose.bloom + this.dose.ripen;

    const dosesArray = [
      {
        id: 'pHDown',
        data: +((this.dose.pHDown * 100) / tot).toFixed(2),
        originalValue: +this.dose.pHDown,
        backgroundColor: '#ccc',
        label: 'PH↓',
        top: 0,
      },
      {
        id: 'Grow',
        data: +((this.dose.grow * 100) / tot).toFixed(2),
        originalValue: +this.dose.grow,
        backgroundColor: '#3ba100',
        label: 'Grow',
        top: 0,
      },
      {
        id: 'Micro',
        data: +((this.dose.micro * 100) / tot).toFixed(2),
        originalValue: +this.dose.micro,
        backgroundColor: '#7b00e0',
        label: 'Micro',
        top: 0,
      },
      {
        id: 'Bloom',
        data: +((this.dose.bloom * 100) / tot).toFixed(2),
        originalValue: +this.dose.bloom,
        backgroundColor: '#dd038a',
        label: 'Bloom',
        top: 0,
      },
      {
        id: 'Ripen',
        data: +((this.dose.ripen * 100) / tot).toFixed(2),
        originalValue: +this.dose.ripen,
        backgroundColor: '#f67f1e',
        label: 'Ripen',
        top: 0,
      },
      {
        id: 'Water',
        data: +((this.dose.water * 100) / tot).toFixed(2),
        originalValue: +this.dose.water,
        backgroundColor: '#00f',
        label: 'Water',
        top: 0,
      },
    ];

    const doseStyle =
      ' ' +
      dosesArray[4].backgroundColor +
      ' ' +
      0 +
      '% ' +
      dosesArray[4].data +
      '%,' +
      ' ' +
      dosesArray[3].backgroundColor +
      ' ' +
      0 +
      '% ' +
      dosesArray[3].data +
      '%,' +
      ' ' +
      dosesArray[2].backgroundColor +
      ' ' +
      dosesArray[3].data +
      '% ' +
      (dosesArray[2].data + dosesArray[3].data) +
      '%,' +
      ' ' +
      dosesArray[1].backgroundColor +
      ' ' +
      (dosesArray[2].data + dosesArray[3].data) +
      '% ' +
      (dosesArray[1].data + dosesArray[2].data + dosesArray[3].data) +
      '%';

    this.styleDoses = {
      height: '8px',
      width: '300px',
      'background-image': `linear-gradient(90deg, ${doseStyle})`,
    };
    this.stylePhDown = {
      height: '8px',

      width: dosesArray[0].data + 'px',
      'background-color': dosesArray[0].backgroundColor,
    };
    this.styleWater = {
      height: '8px',
      width: dosesArray[5].data + 'px',
      'background-color': dosesArray[5].backgroundColor,
    };

    const style = document.createElement('style');
    style.innerHTML = '';
    dosesArray.map((el) => {
      if (el.data > 0) {
        const rowstyle = `
          .${el.id}_${this.dose?.id} {
            width: ${ el.id==='pHDown'? 10 : 3*el.data}px;
          }

          .${el.id}_${this.dose?.id}:after {
            font-size: 9px;
            dispaly:block;
            position:relative;
            content:  "${ el.id==='pHDown'? el.originalValue : el.label +' '+ el.originalValue + 'ml'}";
            z-index: 1;
            line-height:0
          }
        `;
        style.innerHTML += rowstyle;
      }
    });
    document.body.appendChild(style);
  }
}
