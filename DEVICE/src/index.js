import { AppSetup } from "../app/utils/app-setup.ts";
class Main {
    // Your Main class as previously defined
    constructor() {
        const app = new AppSetup();
        app.start();
    }
}
new Main();
