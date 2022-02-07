/**
 * pH Sensors
 */

var MiniPh = require('./index.js');

var miniPh = new MiniPh('/dev/i2c-0', 0x4d);

class PhProbe {
  id: number;
  
  constructor(id) {
    this.id = id;
  }
  async read() {
    const self = this;
    return new Promise(resolve => {
      miniPh.readPh(function (err, m) {
        if (err) {
          console.log(err);
        } else {
          console.log({
            raw : m.raw,
            pH : m.ph,
            filter: m.filter
          });
        }
      });
      resolve;
    });
  }
}
export default PhProbe;
