import http from "http";
import { SettingsService } from "../services/settings/settings.service";
import { DbService } from "../services/db/db.service";
import { ApiService } from "../services/api/api.service";
import { AiService } from "../services/ai/ai.service";
import { WebServer } from "../utils/http-server";
import { Logger } from "../utils/logger";
import { Scheduler } from "../utils/scheduler";

export class AppSetup {
  private server: http.Server | null = null;
  private readonly settings: SettingsService;
  private readonly api: ApiService;
  private readonly ai: AiService;
  private readonly db: DbService;
  private clock: number | null = null;

  constructor(
    settingsService: SettingsService = new SettingsService(),
    apiService: ApiService = new ApiService(),
    aiService: AiService = new AiService(),
    dbService: DbService = new DbService(settingsService, apiService)
  ) {
    this.settings = settingsService;
    this.api = apiService;
    this.ai = aiService;
    this.db = dbService;
  }

  async start(): Promise<void> {
    try {
      // Initialize AI service
      await this.ai.init();

      // Setup global error handling
      Logger.setupErrorHandling();

      // Initialize clock interval
      this.clock = this.settings.getClockInterval();

      // Load database
      await this.db.load();

      // Initialize and start the web server (await the promise)
      this.server = await new WebServer(this.settings, this.db, this.api, this.ai).init();

      // Set up the scheduler
      const scheduler = new Scheduler(this.db);
      scheduler.setMainSchedule();

      console.log("[main] => init done");
    } catch (err) {
      console.error("Error during app setup:", err);
    }
  }

  stop(): void {
    // Implement server shutdown and cleanup logic here
    if (this.server) {
      this.server.close(() => {
        console.log("[main] => server closed");
      });
    }
  }
}
