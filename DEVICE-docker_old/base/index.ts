import * as path from "path";
import moment from "moment";

import { ServerCommands } from "@voidbrain/grover-shared-code/enum";

class Main {
  // Your Main class as previously defined
  constructor() {
    this.mainLoop();
  }

  private mainLoop(): void {
    console.log("Main class is alive!");
    setInterval(() => {
    
    }, 1000); // Logs a heartbeat every second
  }
}

new Main();
