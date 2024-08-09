import http from "http";
import { SettingsService } from "../services/settings/settings.service";
import { DbService } from "../services/db/db.service";
import { ApiService } from "../services/api/api.service";
import { AiService } from "../services/ai/ai.service";
import { WebServer } from "../utils/http-server";
import { Logger } from "../utils/logger";
import { Scheduler } from "../utils/scheduler";

export class AppSetup {
  server: http.Server;
  settings: SettingsService;
  api: ApiService;
  ai: AiService;
  db: DbService;
  clock: number;

  constructor() {
    this.settings = new SettingsService();
    this.api = new ApiService();
    this.ai = new AiService();
    this.db = new DbService(this.settings, this.api);
  }

  async start() {
    await this.ai.init();
    Logger.setupErrorHandling();
    this.clock = this.settings.getClockInterval();

    try {
      await this.db.load();
      this.server = new WebServer(
        this.settings,
        this.db,
        this.api,
        this.ai,
      ).init();
      const scheduler = new Scheduler(this.db);
      scheduler.setMainSchedule();

      console.log("[main] => init done");
      // Add more initialization as needed
    } catch (err) {
      console.error("Error during app setup:", err);
    }
  }
}
