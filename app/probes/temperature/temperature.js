/**
 * Temperature DS18B20 Sensors
 */

const sensor = require('ds18x20');

class Temperature {
  constructor(id) {
  this.id = id;
  }
  async read() {
    const self = this;
    return new Promise(resolve => {
      sensor.get(self.id, function (err, tempObj) {
        if (err) { throw err; }
        resolve(tempObj);
      });
    });
  }
}
export default Temperature;
