/**
 * EC Sensors
 */

class EcProbe {
  constructor(id) {
    this.id = id;
  }
  async read() {
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
export default EcProbe;
