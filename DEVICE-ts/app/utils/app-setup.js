import { SettingsService } from "../services/settings/settings.service.ts";
import { DbService } from "../services/db/db.service.ts";
import { ApiService } from "../services/api/api.service.ts";
import { AiService } from "../services/ai/ai.service.ts";
import { WebServer } from "../utils/http-server.ts";
import { Logger } from "../utils/logger.ts";
import { Scheduler } from "../utils/scheduler.ts";
import RoomComponent from "../hw-components/environment/room/room.ts";
import { Owner, ServerCommands, } from "../services/settings/enums.ts";
import { LocalStorage } from "node-localstorage";
export class AppSetup {
    constructor(settingsService = new SettingsService(), apiService = new ApiService(), aiService = new AiService(), dbService = new DbService(settingsService, apiService)) {
        this.server = null;
        this.clock = null;
        this.debug = true;
        this.rooms = [];
        this.pots = [];
        this.localStorage = new LocalStorage("./data/scratch");
        this.settings = settingsService;
        this.api = apiService;
        this.ai = aiService;
        this.db = dbService;
        this.webServerPort = 8084;
    }
    async start() {
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
            this.server = await new WebServer(this.settings, this.db, this.api, this.ai, this.rooms).init();
            console.log("[main] => init done");
        }
        catch (err) {
            console.error("Error during app setup:", err);
        }
    }
    async setupRoom() {
        try {
            // Lost part
            const endpoint = "endpoint";
            const action = ServerCommands.START;
            const lastUpdate = this.localStorage.getItem(this.settings.getAppName()) ?? "";
            this.serialNumber = await this.settings.getSerialNumber();
            const device = await this.api.get(endpoint, lastUpdate, action, this.serialNumber.sn, this.webServerPort);
            this.settings.setOperatingMode(device.item.operatingMode);
            console.log("[main] => init done");
            const owner = Owner.start;
            const operatingMode = this.settings.getOperatingMode();
            this.SYS_LOG({ owner, operatingMode });
            //* */
            this.room = new RoomComponent(this.serialNumber.sn, this.db, this.api, this.settings);
            await this.room.setup();
            this.pots = this.room.pots;
            this.rooms.push(this.room);
            console.log(`[main] => ready`);
            // /Lost part
        }
        catch (err) {
            console.error("Error during setupRoom:", err);
        }
    }
    async SYS_LOG({ owner, operatingMode, expectedTime = null }) {
        return new Promise(async (resolve) => {
            const systemOperatingMode = this.settings.getOperatingMode();
            if (operatingMode >= systemOperatingMode) {
                const job = {
                    owner,
                    action: ServerCommands.SYS_LOG,
                    expectedTime: expectedTime ? new Date(expectedTime) : null,
                    executedTime: new Date(),
                    operatingMode: operatingMode,
                    systemOperatingMode: systemOperatingMode,
                    serialNumber: this.serialNumber.sn,
                };
                switch (owner) {
                    case Owner.start: // system start
                        if (this.debug) {
                            console.log("[MAIN]: system log on start");
                        }
                        if (this.settings.getLogMode() === true) {
                            await this.db.logItem("system_log", job);
                            resolve(job);
                        }
                        break;
                    case Owner.user: // manual action
                        if (this.debug) {
                            console.log("[MAIN]: system log manual");
                        }
                        if (this.settings.getLogMode() === true) {
                            await this.db.logItem("system_log", job);
                            resolve(job);
                        }
                        break;
                    case Owner.schedule: // scheduled action
                        if (this.debug) {
                            console.log("[MAIN]: system log scheduled");
                        }
                        if (this.settings.getLogMode() === true) {
                            await this.db.logItem("system_log", job);
                            resolve;
                        }
                        break;
                }
            }
            else {
                if (this.debug) {
                    console.log(`[MAIN]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
                }
            }
        });
    }
    stop() {
        // Implement server shutdown and cleanup logic here
        if (this.server) {
            this.server.close(() => {
                console.log("[main] => server closed");
            });
        }
    }
}
