/**
 * Water Refill Actuator
 */
import PinPWM from 'pigpio-l298n/PinPWM.js';
import PinWrite from 'pigpio-l298n/PinWrite.js';

// enableA,in1,in2, enableB,in3,in4
// let l298n = new l298nModule(14,15,18, 21,20,16);

class WaterRefill {
  deviceList = [];
  dNum;
  
  constructor(dNum, en, in1, in2) {
    if(dNum !== null && en && in1 && in2) {
      this.dNum = dNum;
      this.deviceList[dNum] = {
        dNum: dNum,
        en: en,
        in1: in1,
        in2: in2,
        enGpio: new PinPWM(en),
        in1Gpio: new PinWrite(in1),
        in2Gpio: new PinWrite(in2),
      };
    } else {
      console.log('error');
    }
  }

  enPort() {
    return this.deviceList[this.dNum].enGpio;
  }

  in1Port() {
      return this.deviceList[this.dNum].in1Gpio;
  }

  in2Port() {
      return this.deviceList[this.dNum].in2Gpio;
  }

  // WaterRefill(dNum, en, in1, in2) {
  //   initDevice(this.dNum, en, in1, in2);
  // }

  setSpeed(speed) {
    this.enPort(this.dNum).setSpeedPercent(speed);
  }
  forward() {
    this.in1Port(this.dNum).HIGH();
    this.in2Port(this.dNum).LOW();
  }

  backward() {
    this.in1Port(this.dNum).LOW();
    this.in2Port(this.dNum).HIGH();
  }

  stop() {
    this.in1Port(this.dNum).LOW();
    this.in2Port(this.dNum).LOW();
  }
}
export default WaterRefill;
