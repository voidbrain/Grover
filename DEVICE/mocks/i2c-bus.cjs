const mockI2cBus = {
  openSync: () => {
    return {
      writeByteSync: () => console.log('mock writeByteSync called'),
      readByteSync: () => console.log('mock readByteSync called'),
      writeI2cBlockSync: () => console.log('mock writeI2cBlockSync called'),
      // other i2c methods
    };
  },
};

module.exports = mockI2cBus;
