// import express from 'express';

// const app = express();
// const PORT = process.env.PORT || 3000;



// app.get('/', (_req: express.Request, res: express.Response) => {
//     res.send('Hello, World!');
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
import { AppSetup } from "./app/utils/app-setup";

class Main {
  // Your Main class as previously defined
  constructor() {
    const app = new AppSetup();
    app.start();
  }
}

new Main();
