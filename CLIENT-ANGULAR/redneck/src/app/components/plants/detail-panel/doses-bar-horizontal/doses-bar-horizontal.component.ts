import { Component, Input, OnChanges } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';
import { DoseInterface } from '../../../../interfaces/dose';
import { SanitizeHtmlPipe } from '../../../../pipes/sanitize-html/sanitize-html.pipe';

@Component({
  selector: 'app-doses-bar-horizontal',
  templateUrl: './doses-bar-horizontal.component.html',
  standalone: true,
  imports: [IonCol, IonGrid, IonRow, NgStyle, SanitizeHtmlPipe],
  styleUrls: ['./doses-bar-horizontal.component.scss'],
})
export class DosesBarHorizontalComponent implements OnChanges {
  @Input() dose!: DoseInterface;
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
        data: +this.dose.water.toFixed(2),
        originalValue: +this.dose.water,
        backgroundColor: '#00f',
        label: 'Water',
        top: 0,
      },
    ];

    const pHDown = dosesArray.find((el) => el.id === 'pHDown');
    const Grow = dosesArray.find((el) => el.id === 'Grow');
    const Micro = dosesArray.find((el) => el.id === 'Micro');
    const Bloom = dosesArray.find((el) => el.id === 'Bloom');
    const Ripen = dosesArray.find((el) => el.id === 'Ripen');
    const Water = dosesArray.find((el) => el.id === 'Water');

    const doseStyle =
      Ripen?.backgroundColor +
      ' ' +
      0 +
      '% ' +
      Ripen?.data +
      '%,' +
      Bloom?.backgroundColor +
      ' ' +
      0 +
      '% ' +
      Bloom?.data +
      '%,' +
      Micro?.backgroundColor +
      ' ' +
      Bloom?.data +
      '% ' +
      ((Micro?.data ?? 0) + (Bloom?.data ?? 0)) +
      '%,' +
      Grow?.backgroundColor +
      ' ' +
      ((Micro?.data ?? 0) + (Bloom?.data ?? 0)) +
      '% ' +
      ((Grow?.data ?? 0) + (Micro?.data ?? 0) + (Bloom?.data ?? 0)) +
      '%';

    this.styleDoses = {
      height: '8px',
      width: '300px',
      'background-image': `linear-gradient(90deg, ${doseStyle})`,
    };
    this.stylePhDown = {
      height: '8px',

      width: 3 + 'px',
      'background-color': pHDown?.backgroundColor,
    };
    this.styleWater = {
      height: '8px',
      width: Water?.data + 'px',
      'background-color': Water?.backgroundColor,
    };

    const style = document.createElement('style');
    style.innerHTML = '';
    dosesArray.map((el) => {
      if (el.data > 0) {
        const rowstyle = `
          .${el.id}_${this.dose?.id} {
            width: ${
              el.id === 'pHDown' ? 10 : el.id === 'Water' ? '' : 3 * el.data
            }px;
          }

          .${el.id}_${this.dose?.id}:after {
            font-size: 9px;
            dispaly:block;
            position:relative;
            content:  "${el.id === 'pHDown' ? '' : el.label + ' ' + el.originalValue + 'ml'}";
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
