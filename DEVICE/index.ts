import "module-alias/register";
import http from "http";
import url from "url";
import * as fs from "fs";
import * as util from "util";
import { LocalStorage } from "node-localstorage";
import moment from "moment";
import schedule from "node-schedule";
import process from "process";

import {
  EventEmitter,
  OperatingModes,
  ServerCommands,
  ServerPages,
} from "./app/services/settings/enums";
import SettingsService from "./app/services/settings/settings.service";
import DbService from "./app/services/db/db.service";
import ApiService from "./app/services/api/api.service";

import AiService from "./app/services/ai/ai.service";

import { RoomObject } from "./app/interfaces/room";
import RoomComponent from "./app/hw-components/environment/room/room";
import { PotObject } from "./app/interfaces/pot";
import { LocationInterface } from "./app/interfaces/location";
import { CronJobInterface } from "./app/interfaces/cron-job";

class Main {
  server: http.Server;
  webServerPort: number;
  serialNumber: { sn: string; found: boolean };

  clock: number;
  scheduledCrons: any[] = [];
  settings = new SettingsService();
  api = new ApiService();
  ai = new AiService();
  db = new DbService(this.settings, this.api);
  localStorage = new LocalStorage("./data/scratch");

  room: RoomObject;
  rooms: RoomObject[] = [];
  pots: PotObject[] = [];

  debug = true;

  constructor() {
    this.appSetup();
  }

  async appSetup() {
    await this.ai.init();

    const log_file_err = fs.createWriteStream("./error.log", { flags: "a" });
    const now = moment();
    process
      .on("unhandledRejection", (reason, p) => {
        console.error(reason, "Unhandled Rejection at Promise", p);
        log_file_err.write(
          `${now} – Unhandled Rejection at Promise: ${util.format(p)}\n`
        );
      })
      .on("uncaughtException", (err) => {
        console.error(err, "Uncaught Exception thrown");
        log_file_err.write(`${now} – Caught exception: ${util.format(err)}\n`);
        process.exit(1);
      });

    try {
      await this.db.load();
      this.clock = this.settings.getClockInterval();
      this.serialNumber = await this.settings.getSerialNumber();
      this.server = http.createServer();
      this.webServerPort = 8084;
      this.webServerSetup();

      const endpoint = "endpoint";
      const action = ServerCommands.START;
      const lastUpdate = this.localStorage.getItem(this.settings.getAppName());

      const device: any = await this.api.get(
        endpoint,
        lastUpdate,
        action,
        this.serialNumber.sn,
        this.webServerPort
      );
      this.settings.setOperatingMode(device.item.operatingMode);

      console.log("[main] => init done");
      const emitter = EventEmitter.start;
      const operatingMode = this.settings.getOperatingMode();
      await this.SYS_LOG({ emitter, operatingMode });
      await this.main();
    } catch (err) {
      console.error("Error during app setup:", err);
    }
  }

  async main() {
    try {
      this.setMainSchedule();

      this.room = new RoomComponent(
        this.serialNumber.sn,
        this.db,
        this.api,
        this.settings
      ) as unknown as RoomObject;
      await this.room.setup();
      this.pots = this.room.pots;
      this.rooms.push(this.room);

      console.log(`[main] => ready`);
    } catch (err) {
      console.error("Error in main method:", err);
    }
  }

  async SYS_LOG({ emitter, operatingMode, expectedTime = null }) {
    try {
      const systemOperatingMode = this.settings.getOperatingMode();
      if (operatingMode >= systemOperatingMode) {
        const job = {
          emitter,
          action: ServerCommands.SYS_LOG,
          expectedTime: expectedTime ? new Date(expectedTime) : null,
          executedTime: new Date(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: this.serialNumber.sn,
        };

        if (this.settings.getLogMode() === true) {
          await this.db.logItem("system_log", job);
        }
      } else {
        if (this.debug) {
          console.log(
            `[MAIN]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`
          );
        }
      }
    } catch (err) {
      console.error("Error in SYS_LOG method:", err);
    }
  }

  async updateOperatingMode(mode: number) {
    try {
      if (Object.values(OperatingModes).includes(mode)) {
        this.settings.setOperatingMode(mode);
        await Promise.all(
          this.rooms.map(async (room) => {
            await Promise.all(
              room.probes.map(async (probe) => {
                await probe.component?.setStatus(EventEmitter.start);
              })
            );
            await Promise.all(
              room.workers.map(async (worker) => {
                await worker.component?.setStatus(EventEmitter.start);
              })
            );
            await Promise.all(
              room.pots.map(async (pot) => {
                await Promise.all(
                  pot.probes.map(async (probe) => {
                    await probe.component?.setStatus(EventEmitter.start);
                  })
                );
                await Promise.all(
                  pot.workers.map(async (worker) => {
                    await worker.component?.setStatus(EventEmitter.start);
                  })
                );
              })
            );
          })
        );
        return mode;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Error in updateOperatingMode method:", err);
      return false;
    }
  }

  async setMainSchedule() {
    try {
      this.scheduledCrons = (await this.db.getItems(
        "system_schedule"
      )) as unknown as any[];
      const scheduleArr: CronJobInterface[] = this.scheduledCrons.map(
        (systemScheduleRow) => ({
          action: systemScheduleRow.action,
          cron: `${systemScheduleRow.atMinute} ${systemScheduleRow.atHour} * * ${systemScheduleRow.atDay}`,
          operatingMode: systemScheduleRow.operatingMode,
        })
      );

      scheduleArr.forEach((job) => {
        schedule.scheduleJob(job.cron, async (expectedTime) => {
          const emitter = EventEmitter.schedule;
          await this[job.action]({
            expectedTime: expectedTime.toISOString(),
            emitter: emitter,
            operatingMode: job.operatingMode,
          });
        });
      });
    } catch (err) {
      console.error("Error in setMainSchedule method:", err);
    }
  }

  hasMethod(subject: any, methodName: string): boolean {
    return subject != null && typeof subject[methodName] === "function";
  }

  serverStart() {
    this.server.on("request", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
      res.setHeader("Access-Control-Max-Age", 2592000);

      res.writeHead(200, { "Content-Type": "text/plain" });
      const u = req.url;
      const q = url.parse(req.url, true);
      if (q.pathname === "/favicon.ico") {
        res.writeHead(200, { "Content-Type": "image/x-icon" });
        res.end();
        return;
      }
      const action: string = q.query.action as string;
      const page: string | null = q.pathname;
      const emitter: string = EventEmitter.user;
      const operatingMode: number = this.settings.getOperatingMode();
      const now = moment();

      try {
        switch (page) {
          case `/${ServerPages.actuators}`:
            const id = q.query.id as string;
            const terminalType = q.query.type as string;
            if (action && id && terminalType) {
              let duration = q.query.duration ? +q.query.duration : 0;

              const terminal: any = await this.db.getItem(
                terminalType + "s_list",
                +id,
                "id"
              );
              const parentLocation: LocationInterface = await this.db.getItem(
                "locations",
                +terminal.locationId,
                "id"
              );
              const parent: any = await this.db.findParent(parentLocation.id);
              const environments = +parent.parent > 0 ? this.pots : this.rooms;
              const environmentType = +parent.parent > 0 ? "pot" : "room";
              const environment = environments.find(
                (el) =>
                  +el[environmentType].locationId ===
                  +parent[`${environmentType}LocationId`]
              );
              if (environment) {
                if (terminalType + "s" in environment) {
                  const el = environment[terminalType + "s"].find(
                    (el) => +el[`id`] === +id
                  );
                  if (el) {
                    const hasMethod = this.hasMethod(el.component, action);
                    if (hasMethod) {
                      // console.log("1", now, emitter, operatingMode, duration, action);
                      const doJob = await el.component[action]({ now, emitter, operatingMode, duration });

                      if (this.debug) {
                        console.log("[SERVER]: ", JSON.stringify(doJob));
                      }
                      res.write(JSON.stringify(doJob));
                    } else {
                      if (this.debug) {
                        console.log("[SERVER]: ##################");
                        console.log(`[SERVER]: Action ${action} not found`);
                        console.log("[SERVER]: ", el.component);
                        console.log("[SERVER]: ##################");
                      }
                      res.write(
                        JSON.stringify({
                          error: `[SERVER]: Action ${action} not found`,
                        })
                      );
                    }
                  } else {
                    if (this.debug) {
                      console.log(`[SERVER]: Error el.component not found`);
                    }
                    res.write(
                      JSON.stringify({
                        error: `[SERVER]: Error el.component not found`,
                      })
                    );
                  }
                } else {
                  if (this.debug) {
                    console.log(
                      `[SERVER]: Error terminalType in env not found`
                    );
                  }
                  res.write(
                    JSON.stringify({
                      error: `[SERVER]: Error terminalType in env not found`,
                    })
                  );
                }
              } else {
                const err = `[SERVER]: environment not found LIST: [${environments.map(
                  (el) => el[environmentType].id
                )}], ? = ${parent.id}`;
                if (this.debug) {
                  console.log("[SERVER]: ", err);
                }
                res.write(JSON.stringify({ error: err }));
              }
            } else {
              if (this.debug) {
                console.log(
                  `[SERVER]: Error ${action}, ${id}, ${terminalType}`
                );
              }
              res.write(
                JSON.stringify({
                  error: `Error ${action}, ${id}, ${terminalType}`,
                })
              );
            }
            break;
          case `/${ServerPages.system}`:
            switch (action) {
              case ServerCommands.SET_MODE:
                const mode = +q.query.type as number;
                const updatedMode = await this.updateOperatingMode(mode);
                if (this.debug) {
                  console.log("[SERVER]: ", updatedMode);
                }
                res.write(JSON.stringify({ mode: updatedMode }));
                const systemOperatingMode = this.settings.getOperatingMode();
                const job = {
                  emitter,
                  action: ServerCommands.SET_MODE,
                  expectedTime: null,
                  executedTime: new Date(),
                  operatingMode: operatingMode,
                  systemOperatingMode: systemOperatingMode,
                  serialNumber: this.serialNumber.sn,
                };
                if (this.debug) {
                  console.log("[MAIN]: system log manual");
                }
                if (this.settings.getLogMode() === true) {
                  await this.db.logItem("system_log", job);
                }
                break;

              case ServerCommands.AI_GET_DOSES:
                const waterLevel = q.query.waterLevel;
                const plantAge = q.query.waterLevel;
                const desiredEC = q.query.waterLevel;
                const desiredPH = q.query.waterLevel;
                this.ai.getDoses({ waterLevel, plantAge, desiredEC, desiredPH });
                break;
              case ServerCommands.AI_GET_EC_PH:
                this.ai.getEcPh({ plantAge: q.query.plantAge });
                break;
              case ServerCommands.AI_TRAIN_DOSES_MODEL:
                this.ai.defineDosesModel();
                const resultDosesModel = await this.ai.trainDosesModel();
                res.write(JSON.stringify({ result: resultDosesModel }));
                break;
              case ServerCommands.AI_TRAIN_EC_PH:
                this.ai.defineEcPhModel();
                const resultEcPhModel = await this.ai.trainEcPhModel();
                res.write(JSON.stringify({ result: resultEcPhModel }));
                break;

              default:
                res.write(
                  JSON.stringify({
                    error: `Action "${action}" not found for page "${page}"`,
                  })
                );
                break;
            }
            break;
          default:
            res.write(JSON.stringify({ error: `Page "${page}" not found` }));
            break;
        }
      } catch (err) {
        console.error("Error handling request:", err);
        res.write(JSON.stringify({ error: "Internal server error" }));
      }
      res.end();
    });

    this.server.listen(this.webServerPort, () => {
      console.log(`Server running at http://localhost:${this.webServerPort}/`);
    });
  }

  webServerSetup() {
    this.serverStart();
    // Implement your web server setup logic here
  }
}

new Main();
