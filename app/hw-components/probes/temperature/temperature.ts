/**
 * Temperature DS18B20 Sensors
 */

import sensor from 'ds18x20';
  

class TemperatureComponent {
  id: number;
  
  constructor(id:number) {
  this.id = id;
  }
  async read() {
    const self = this;
    return new Promise(resolve => {
      sensor.get(self.id, function (err: any, tempObj: any) {
        if (err) { throw err; }
        resolve(tempObj);
      });
    });
  }
}
export default TemperatureComponent;
