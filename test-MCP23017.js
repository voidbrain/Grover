import MCP23017 from 'node-mcp23017';

class Main {
  mcp;
  
  constructor(){ this.main(); }

  async main(){
    process.on("SIGINT", () => {
      console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    });
    this.mcp = new MCP23017({
      address: 0x23, //default: 0x20
      device: 1, // '/dev/i2c-1' on model B | '/dev/i2c-0' on model A
      debug: true //default: false
    });

    this.mcp.pinMode(0, this.mcp.OUTPUT);
    this.mcp.pinMode(1, this.mcp.OUTPUT);

    console.log('start');
    await this.forward();
    setTimeout(async () => {
      console.log('stop');
      await this.stop();
    }, 3000)
  
  };

  async forward () {
    this.mcp.digitalWrite(0, this.mcp.HIGH); 
    this.mcp.digitalWrite(1, this.mcp.LOW); 
    return
  };
  async backward () {
    this.mcp.digitalWrite(0, this.mcp.LOW); 
    this.mcp.digitalWrite(1, this.mcp.HIGH); 
    return
  };
  async stop () {
    this.mcp.digitalWrite(0, this.mcp.LOW); 
    this.mcp.digitalWrite(1, this.mcp.LOW); 
    return
  };

}


const app = new Main();
