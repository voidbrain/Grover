/**
 * EC Sensors
 */

class EcProbeComponent {
  triggerPin: number;
  echoPin: number;
  
  constructor(triggerPin: number, echoPin: number) {
    triggerPin = triggerPin;
    echoPin = echoPin;
  }

  async read() {
    
    return new Promise(resolve => {
      // sensor.get(self.id, function (err, tempObj) {
      //  if (err) { throw err; }
      //  resolve({id: self.id, value: tempObj});
      //  });
      resolve;
    });
  }
}
export default EcProbeComponent;
