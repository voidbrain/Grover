// Mock implementation of ds18x20 library

class MockDs18x20 {
  constructor() {
    this.devices = [];
  }

  // Mock methods
  scan() {
    // Return mock devices
    return Promise.resolve(this.devices);
  }

  read(deviceId) {
    // Mock reading device content
    if (this.devices.includes(deviceId)) {
      // Return mock temperature data
      return Promise.resolve('65 01 4b 46 7f ff 0c 10 6a : crc=6a YES\n65 01 4b 46 7f ff 0c 10 6a t=23125\n');
    } else {
      return Promise.reject(new Error('Device not found'));
    }
  }

  addDevice(deviceId) {
    // Add a device to the mock list
    this.devices.push(deviceId);
  }
}

module.exports = MockDs18x20;
