/**
 * Water Refill Actuator
 */


var l298nModule = require('motor-l298n');

var speed      = 100; // Percentage
var in1Pin     = 17;
var in2Pin     = 27;
var enable1Pin = 12;
var in3Pin     = 5;
var in4Pin     = 6;
var enable2Pin = 13;

class WaterRefill {
  constructor(id) {
    this.id = id;
     this.l298n = l298nModule.setup(in1Pin, in2Pin, enable1Pin, in3Pin, in4Pin, enable2Pin);
  }
  async run() {
    const self = this;
    return new Promise(resolve => {

      self.l298n.forward(l298nModule.LEFT);
      self.l298n.forward(l298nModule.RIGHT);
      self.l298n.setSpeed(l298nModule.LEFT,speed);
      self.l298n.setSpeed(l298nModule.RIGHT,speed);
      // console.log("Moving forward!!");

      setTimeout(function() {
        self.l298n.stop(l298nModule.LEFT);
        self.l298n.stop(l298nModule.RIGHT);
        // console.log("All done!");
      }, 180*1000);

      resolve;
    });
  }
}
export default WaterRefill;
