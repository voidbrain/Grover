import MCP23017 from 'node-mcp23017';

main ();

async function main(){

  const pin1 = 0;
  const pin2 = 1;
  const pin3 = 6;
  const pin4 = 7;

  process.on("SIGINT", () => {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  });

  const mcp1 = new MCP23017({
    address: 0x23, 
    device: 1,
    debug: true
  });

  const mcp2 = new MCP23017({
    address: 0x23, 
    device: 1,
    debug: true
  });

  mcp1.pinMode(pin1, mcp1.OUTPUT);
  mcp1.pinMode(pin2, mcp1.OUTPUT);

  mcp2.pinMode(pin3, mcp2.OUTPUT);
  mcp2.pinMode(pin4, mcp2.OUTPUT);

  // mcp1.pinMode(pin3, mcp2.OUTPUT);
  // mcp1.pinMode(pin4, mcp2.OUTPUT);
  
  mcp1.digitalWrite(pin1, mcp1.HIGH); 
  mcp1.digitalWrite(pin2, mcp1.LOW); 

  setTimeout(() => {
    mcp1.digitalWrite(pin1, mcp1.LOW); 
    mcp1.digitalWrite(pin2, mcp1.LOW); 


    mcp2.digitalWrite(pin3, mcp2.HIGH); 
    mcp2.digitalWrite(pin4, mcp2.LOW); 
  
    setTimeout(() => {
      mcp2.digitalWrite(pin3, mcp2.LOW); 
      mcp2.digitalWrite(pin4, mcp2.LOW); 
    }, 2000);


  }, 2000);
}
