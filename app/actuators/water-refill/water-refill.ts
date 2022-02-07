/**
 * Water Refill Actuator
 */


const l298nModule = require('pigpio-l298n');

let l298n = new l298nModule(17,27,22,null,null,null);
l298n.setSpeed(l298n.NO1,20);

const speed      = 100; // Percentage
const in1Pin     = 17;
const in2Pin     = 27;
const enable1Pin = 12;
const in3Pin     = 5;
const in4Pin     = 6;
const enable2Pin = 13;

class WaterRefill {
  id: number;
  
  constructor(id) {
    this.id = id;
     // this.l298n = l298nModule.setup(in1Pin, in2Pin, enable1Pin, in3Pin, in4Pin, enable2Pin);
  }
  async run() {
    const self = this;
    return new Promise(resolve => {

      // self.l298n.forward(l298nModule.LEFT);
      // self.l298n.forward(l298nModule.RIGHT);
      // self.l298n.setSpeed(l298nModule.LEFT,speed);
      // self.l298n.setSpeed(l298nModule.RIGHT,speed);
      // // console.log("Moving forward!!");

      // setTimeout(function() {
      //   self.l298n.stop(l298nModule.LEFT);
      //   self.l298n.stop(l298nModule.RIGHT);
      //   // console.log("All done!");
      // }, 180*1000);

      resolve;
    });
  }
}
export default WaterRefill;
