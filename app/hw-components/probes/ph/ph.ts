/**
 * pH Sensors
 */

var MiniPh = require('./index.js');
var miniPh = new MiniPh('/dev/i2c-0', 0x4d);

class PhProbeComponent {
  triggerPin: number;
  echoPin: number;

  constructor(triggerPin: number, echoPin: number) {
    triggerPin = triggerPin;
    echoPin = echoPin;
  }
  async read() {
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
export default PhProbeComponent;
