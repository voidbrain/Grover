import { Component, Input, OnChanges } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';
import { Dose } from '../../../../interfaces/dose';
import { SanitizeHtmlPipe } from '../../../../pipes/sanitize-html/sanitize-html.pipe';

@Component({
  selector: 'app-doses-bar',
  templateUrl: './doses-bar.component.html',
  standalone: true,
  imports: [IonCol, IonGrid, IonRow, NgStyle, SanitizeHtmlPipe],
  styleUrls: ['./doses-bar.component.scss'],
})
export class DosesBarComponent implements OnChanges {
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
        top: 16,
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
        top: 16,
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
      width: '4px',
      height: '100px',
      'background-image': `linear-gradient(${doseStyle})`,
    };
    this.stylePhDown = {
      width: '4px',
      'margin-top': dosesArray[0].top + 'px',
      height: dosesArray[0].data + 'px',
      'background-color': dosesArray[0].backgroundColor,
    };
    this.styleWater = {
      width: '4px',
      'margin-top': dosesArray[5].top + 'px',
      height: dosesArray[5].data + 'px',
      'background-color': dosesArray[5].backgroundColor,
    };

    const style = document.createElement('style');
    style.innerHTML = '';
    dosesArray.map((el) => {
      if (el.data > 0) {
        const rowstyle = `
          .${el.id}_${this.dose?.id} {
            margin-top:${el.top}px;
            height: ${el.data}px;
          }

          .${el.id}_${this.dose?.id}:after {
            font-size: 9px;
            position:relative;
            right: -10px;
            content: "${el.label} ${el.originalValue}ml";
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
