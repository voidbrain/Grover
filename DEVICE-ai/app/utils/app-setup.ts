import http from "http";
import { SettingsService } from "../services/settings/settings.service";
import { DbService } from "../services/db/db.service";
import { ApiService } from "../services/api/api.service";
import { AiService } from "../services/ai/ai.service";
import { WebServer } from "../utils/http-server";
import { Logger } from "../utils/logger";
import { Scheduler } from "../utils/scheduler";
import RoomComponent from "../hw-components/environment/room/room";
import { Owner, ServerCommands } from "../services/settings/enums";
import PotComponent from "../hw-components/environment/pot/pot";
import { LocalStorage } from "node-localstorage";

interface DeviceResponse {
  item: {
    operatingMode: number;
  };
}

export class AppSetup {
  private server: http.Server | null = null;
  private readonly settings: SettingsService;
  private readonly api: ApiService;
  private readonly ai: AiService;
  private readonly db: DbService;
  private clock: number | null = null;
  private debug = true;

  private room: RoomComponent | null = null;
  private rooms: RoomComponent[] = [];
  private pots: PotComponent[] = [];
  serialNumber: { sn: string; found: boolean } | null = null;
  localStorage = new LocalStorage("./data/scratch");
  webServerPort: number;

  constructor(
    settingsService: SettingsService = new SettingsService(),
    apiService: ApiService = new ApiService(),
    aiService: AiService = new AiService(),
    dbService: DbService = new DbService(settingsService, apiService),
  ) {
    this.settings = settingsService;
    this.api = apiService;
    this.ai = aiService;
    this.db = dbService;
    this.webServerPort = 8084;
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

      // Set up the scheduler
      const scheduler = new Scheduler(this.db);
      scheduler.setMainSchedule();

      await this.setupRoom();
      this.server = await new WebServer(
        this.settings,
        this.db,
        this.api,
        this.ai,
        this.rooms,
      ).init();

      console.log("[main] => init done");
    } catch (err) {
      console.error("Error during app setup:", err);
    }
  }

  async setupRoom() {
    try {
      const endpoint = this.settings.getRemoteServerEndpoint();
      const action = ServerCommands.START;
      const lastUpdate =
        this.localStorage.getItem(this.settings.getAppName()) ?? "";
      this.serialNumber = await this.settings.getSerialNumber();
      const device = (await this.api.get(
        endpoint,
        lastUpdate,
        action,
        this.serialNumber.sn,
        this.webServerPort,
      )) as DeviceResponse;
      this.settings.setOperatingMode(device.item.operatingMode);

      console.log("[main] => init done");
      const owner = Owner.start;
      const operatingMode = this.settings.getOperatingMode();
      if (operatingMode !== null) {
        this.SYS_LOG({ owner, operatingMode });
      }

      //* */

      if (this.serialNumber) {
        this.room = new RoomComponent(
          this.serialNumber.sn,
          this.db,
          this.api,
          this.settings,
        );
        await this.room.setup();
        this.pots = this.room.pots;
        this.rooms.push(this.room);
      }
      console.log(`[main] => ready`);
      // /Lost part
    } catch (err) {
      console.error("Error during setupRoom:", err);
    }
  }

  SYS_LOG({
    owner,
    operatingMode,
    expectedTime = null,
  }: {
    owner: Owner;
    operatingMode: number;
    expectedTime?: Date | null;
  }) {
    return new Promise((resolve) => {
      const systemOperatingMode = this.settings.getOperatingMode();
      if (systemOperatingMode !== null && operatingMode >= systemOperatingMode) {
        const job = {
          owner,
          action: ServerCommands.SYS_LOG,
          expectedTime: expectedTime ? new Date(expectedTime) : null,
          executedTime: new Date(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: this.serialNumber ? this.serialNumber.sn : "",
        };
        switch (owner) {
          case Owner.start: // system start
            if (this.debug) {
              console.log("[MAIN]: system log on start");
            }
            if (this.settings.getLogMode() === true) {
              this.db.logItem("system_log", job);
              resolve(job);
            }
            break;
          case Owner.user: // manual action
            if (this.debug) {
              console.log("[MAIN]: system log manual");
            }
            if (this.settings.getLogMode() === true) {
              this.db.logItem("system_log", job);
              resolve(job);
            }
            break;
          case Owner.schedule: // scheduled action
            if (this.debug) {
              console.log("[MAIN]: system log scheduled");
            }
            if (this.settings.getLogMode() === true) {
              this.db.logItem("system_log", job);
              resolve(job);
            }
            break;
        }
      } else {
        if (this.debug) {
          console.log(
            `[MAIN]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`,
          );
        }
      }
    });
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
