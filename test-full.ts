import MCP23017 from 'node-mcp23017';
import i2cBus from 'i2c-bus';
import { Pca9685Driver } from 'pca9685';

const mcp = new MCP23017({
  address: 0x26, //26 --> L298N
  device: 1,
  debug: true
});

const optionsPca9685 = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: false
};

for (var i = 0; i < 16; i++) {
  mcp.pinMode(i, mcp.INPUT);
}

// mcp.digitalWrite(0, mcp.HIGH); //set GPIO A Pin 0 to state HIGH
// mcp.digitalWrite(0, mcp.LOW); //set GPIO A Pin 0 to state LOW

for (var i = 0; i < 16; i++) {
    mcp.digitalRead(i, function (pin, err, value) {
        console.log('mcp Pin ' + pin, value);
        if(err){
            console.log(err)
        }
    });
}

// const pwmPca9685 = new Pca9685Driver(optionsPca9685, function(err) {
//     if (err) {
//         console.error("Error initializing PCA9685");
//         process.exit(-1);
//     }
//     console.log("pwmPca Initialization done");

//     // Set channel 0 to turn on on step 42 and off on step 255
//     // (with optional callback)
//     pwmPca9685.setPulseRange(0, 42, 255, function() {
//         if (err) {
//             console.error("pwmPca Error setting pulse range.");
//         } else {
//             console.log("pwmPca Pulse range set.");
//         }
//     });

//     // Set the pulse length to 1500 microseconds for channel 2
//     pwmPca9685.setPulseLength(0, 1500);

//     // Set the duty cycle to 25% for channel 8
//     pwmPca9685.setDutyCycle(0, 0.25);

//     // Turn off all power to channel 6
//     // (with optional callback)
//     pwmPca9685.channelOff(0, function() {
//         if (err) {
//             console.error("pwmPca Error turning off channel.");
//         } else {
//             console.log("pwmPca Channel 0 is off.");
//         }
//     });

//     // Turn on channel 3 (100% power)
//     pwmPca9685.channelOn(0);
// });
