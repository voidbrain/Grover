var sensor = require('ds18x20');
sensor.loadDriver(function (err) {
  if (err) console.log('something went wrong loading the driver:', err)
  else {
    sensor.list(function (err, listOfDeviceIds) {
      console.log(listOfDeviceIds);
    });
  };
});
