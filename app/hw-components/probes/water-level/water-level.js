/**
 * Water level Sensors
 */

import Gpio from 'pigpio';
const MICROSECDONDS_PER_CM = 1e6/34321; // The number of microseconds it takes sound to travel 1cm at 20 degrees celcius

class WaterLevel {
  constructor(id, triggerPin, echoPin) {
    this.id = id;
    this.triggerPin = triggerPin;
    this.echoPin = echoPin;
  }
  async read() {
    const self = this;
    return new Promise(resolve => {
      const trigger = new Gpio(self.triggerPin, {mode: Gpio.OUTPUT});
      const echo = new Gpio(self.echoPin, {mode: Gpio.INPUT, alert: true});
      trigger.digitalWrite(0); // Make sure trigger is low
      const watchHCSR04 = () => {
        let startTick;
        echo.on('alert', (level, tick) => {
          if (level == 1) {
            startTick = tick;
          } else {
            const endTick = tick;
            const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
            console.log(diff / 2 / MICROSECDONDS_PER_CM);
            resolve('water level result');
          }
        });
       };

      watchHCSR04();
      setInterval(() => {
        trigger.trigger(10, 1); // Set trigger high for 10 microseconds
      }, 1000);

    });
  }
}
export default WaterLevel;
