import MCP23017 from 'node-mcp23017';
import i2cBus from 'i2c-bus';
import { Pca9685Driver } from 'pca9685';


let pwmPca9685;
let mcp;
main (mcp, pwmPca9685);

async function main(mcp, pwmPca9685){
  process.on("SIGINT", () => {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  });
  
  const optionsPca9685 = {
    i2c: i2cBus.openSync(1),
    address: 0x40, // 40=A 70=B
    frequency: 50,
    debug: false
  };
  pwmPca9685 = await setupPwmPca9685(optionsPca9685);
  pwmPca9685.channelOn(0, function(err) {
    if (err) {
        console.error("Error turning off channel.");
    } else {
        console.log("Channel 0 is ON.");
    }

    mcp = new MCP23017({
      address: 0x26, // 26 --> L298N
      device: 1,
      debug: true
    });
  
    mcp.pinMode(0, mcp.OUTPUT);
    mcp.pinMode(1, mcp.OUTPUT);
    
    
    mcp.digitalWrite(0, mcp.HIGH); 
    mcp.digitalWrite(1, mcp.LOW); 
    
  
    setTimeout(() => {
      mcp.digitalWrite(0, mcp.LOW); 
      mcp.digitalWrite(1, mcp.LOW); 
      
  
      setTimeout(() => {
        mcp.digitalWrite(0, mcp.LOW); 
        mcp.digitalWrite(1, mcp.HIGH); 
  
        setTimeout(()=>{
          mcp.digitalWrite(0, mcp.LOW); 
          mcp.digitalWrite(1, mcp.LOW); 
        },2000)
      }, 2000)
    }, 2000)
  }); 
 
};

async function setupPwmPca9685(optionsPca9685){
  return new Promise(async (resolve, reject) => {
    const pwm = await new Pca9685Driver(optionsPca9685, function(err) {
      if (err) {
          console.error("Error initializing PCA9685");
          reject();
          process.exit(-1);
      }
      console.log("pwmPca Initialization done");
      resolve(pwm);
    });
  });
}

// function forward () {
//   mcp.digitalWrite(0, mcp.HIGH); 
//   mcp.digitalWrite(1, mcp.LOW); 
// };
// function backward () {
//   mcp.digitalWrite(0, mcp.LOW); 
//   mcp.digitalWrite(1, mcp.HIGH); 
// };
// function stop () {
//   mcp.digitalWrite(0, mcp.LOW); 
//   mcp.digitalWrite(1, mcp.LOW); 
// };

