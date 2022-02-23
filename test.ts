import MCP23017 from 'node-mcp23017';

main ();

async function main(){
  process.on("SIGINT", () => {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  });

  const mcp = new MCP23017({
    address: 0x23, 
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
  }, 2000);
}
