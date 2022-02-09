/**
 * Water Refill Actuator
 */
import PinPWM from 'pigpio-l298n/PinPWM.js';
import PinWrite from 'pigpio-l298n/PinWrite.js';

import { Device } from '../../../interfaces/water-refill';
import { WaterRefillInterface } from '../../../interfaces/water-refill';

// enableA,in1,in2, enableB,in3,in4
// let l298n = new l298nModule(14,15,18, 21,20,16);



const Direction = {
  forward: 'forward',
  backward: 'backward'
};

class WaterRefillComponent {
  deviceList: Device[] = [];

  dNum: number;
  enPin: number;
  in1Pin: number;
  in2Pin: number;

  constructor(dNum: number, en: number, in1: number, in2: number) {
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

  doJob(direction, speed, time) {
    return new Promise(resolve => {
      this.setSpeed(speed);
      const d = Direction[direction];
      eval('this.'+d+'()');
      setTimeout(() => {
        this.stop();
        resolve(true);
      }, time);
    });
  }

  run1ml() {
    return new Promise(resolve => {
      this.doJob('forward', 60, 4000).then(() => {
        resolve(true);
      })
    });
  }

  setSpeed(speed) {
    this.enPort().setSpeedPercent(speed);
  }
  forward() {
    this.in1Port().HIGH();
    this.in2Port().LOW();
  }

  backward() {
    this.in1Port().LOW();
    this.in2Port().HIGH();
  }

  stop() {
    this.in1Port().LOW();
    this.in2Port().LOW();
  }
}
export default WaterRefillComponent;
