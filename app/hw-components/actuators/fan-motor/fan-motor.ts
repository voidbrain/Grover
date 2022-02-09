/**
 * Fan Motor Actuator
 */

class FanMotorComponent {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
  async run() {
    return new Promise(resolve => {
      // sensor.get(self.id, function (err, tempObj) {
      //  if (err) { throw err; }
      //  resolve({id: self.id, value: tempObj});
      //  });
      resolve;
    });
  }
}
export default FanMotorComponent;
