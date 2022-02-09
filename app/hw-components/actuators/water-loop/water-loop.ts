/**
 * Water Loop Actuator
 */

class WaterLoopComponent {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
  async run() {
    const self = this;
    return new Promise(resolve => {
      // sensor.get(self.id, function (err, tempObj) {
      //  if (err) { throw err; }
      //  resolve({id: self.id, value: tempObj});
      //  });
      resolve;
    });
  }
}
export default WaterLoopComponent;
