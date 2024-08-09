import http from "http";
import { SettingsService } from "../services/settings/settings.service";
import { DbService } from "../services/db/db.service";
import { ApiService } from "../services/api/api.service";
import { AiService } from "../services/ai/ai.service";
import url from "url";
import moment from "moment";

import { RoomObject } from "../../app/interfaces/room";
import { PotObject } from "../../app/interfaces/pot";
import { LocationInterface } from "../../app/interfaces/location";
import { RoomInterface } from "../../app/interfaces/room";
import { PotInterface } from "../../app/interfaces/pot";
import { CronJobInterface, ExtendedCronJobInterface } from "../../app/interfaces/cron-job";
import schedule from "node-schedule";

import {
  EventEmitter,
  OperatingModes,
  ServerCommands,
  ServerPages,
} from "../../app/services/settings/enums";

export class WebServer {
  debug = true;
  server: http.Server;

  pots: PotObject[] = [];
  rooms: RoomObject[] = [];
  serialNumber: { sn: string; found: boolean };
  scheduledCrons: ExtendedCronJobInterface[] = [];

  constructor(
    private settings: SettingsService,
    private db: DbService,
    private api: ApiService,
    private ai: AiService,
  ) {}

  async init(): Promise<http.Server> {
    this.serialNumber = await this.settings.getSerialNumber();
    this.server = http.createServer(this.handleRequest.bind(this));
    this.server.listen(8084, () => {
      console.log(`Server running at http://localhost:8084/`);
    });

    return this.server;
  }

  async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.setHeader("Access-Control-Max-Age", 2592000);

    res.writeHead(200, { "Content-Type": "text/plain" });
    const q = url.parse(req.url!, true);
    if (q.pathname === "/favicon.ico") {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      res.end();
      return;
    }
    const action: string = q.query.action as string;
    const page: string | null = q.pathname;
    const emitter: string = EventEmitter.user;
    const operatingMode: number | null = this.settings.getOperatingMode();
    const now = moment();

    try {
      switch (page) {
        case `/${ServerPages.actuators}`: {
          const id = q.query.id as string;
          const terminalType = q.query.type as string;
          if (action && id && terminalType) {
            const duration = q.query.duration ? +q.query.duration : 0;

            const terminal: LocationInterface | RoomInterface | PotInterface  = await this.db.getItem(
              terminalType + "s_list",
              +id,
              "id",
            );
            const parentLocation: LocationInterface = await this.db.getItem(
              "locations",
              +terminal.locationId,
              "id",
            );
            const parent: LocationInterface | RoomInterface | PotInterface = await this.db.findParent(parentLocation.id);
            const environments = +parent.parent > 0 ? this.pots : this.rooms;
            const environmentType = +parent.parent > 0 ? "pot" : "room";
            const environment = environments.find(
              (el) =>
                +el[environmentType].locationId ===
                +parent[`${environmentType}LocationId`],
            );
            if (environment) {
              if (terminalType + "s" in environment) {
                const el = environment[terminalType + "s"].find(
                  (el) => +el[`id`] === +id,
                );
                if (el) {
                  const hasMethod = this.hasMethod(el.component, action);
                  if (hasMethod) {
                    // console.log("1", now, emitter, operatingMode, duration, action);
                    const doJob = await el.component[action]({
                      now,
                      emitter,
                      operatingMode,
                      duration,
                    });

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
                      }),
                    );
                  }
                } else {
                  if (this.debug) {
                    console.log(`[SERVER]: Error el.component not found`);
                  }
                  res.write(
                    JSON.stringify({
                      error: `[SERVER]: Error el.component not found`,
                    }),
                  );
                }
              } else {
                if (this.debug) {
                  console.log(`[SERVER]: Error terminalType in env not found`);
                }
                res.write(
                  JSON.stringify({
                    error: `[SERVER]: Error terminalType in env not found`,
                  }),
                );
              }
            } else {
              const err = `[SERVER]: environment not found LIST: [${environments.map(
                (el) => el[environmentType].id,
              )}], ? = ${parent.id}`;
              if (this.debug) {
                console.log("[SERVER]: ", err);
              }
              res.write(JSON.stringify({ error: err }));
            }
          } else {
            if (this.debug) {
              console.log(`[SERVER]: Error ${action}, ${id}, ${terminalType}`);
            }
            res.write(
              JSON.stringify({
                error: `Error ${action}, ${id}, ${terminalType}`,
              }),
            );
          }
          break;
        }
        case `/${ServerPages.system}`: {
          switch (action) {
            case ServerCommands.SET_MODE: {
              const mode = +q.query.type! as number;
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
            }

            case ServerCommands.AI_GET_DOSES: {
              const waterLevel = q.query.waterLevel;
              const plantAge = q.query.plantAge;
              const desiredEC = q.query.desiredEC;
              const desiredPH = q.query.desiredPH;
              const resultGetDoses = await this.ai.getDoses({
                waterLevel,
                plantAge,
                desiredEC,
                desiredPH,
              });
              res.write(JSON.stringify({ result: resultGetDoses }));
              break;
            }
            case ServerCommands.AI_GET_EC_PH: {
              const resultGetEcPh = await this.ai.getEcPh({
                plantAge: q.query.plantAge,
              });
              res.write(JSON.stringify({ result: resultGetEcPh }));
              break;
            }
            case ServerCommands.AI_TRAIN_DOSES_MODEL: {
              this.ai.defineDosesModel();
              const resultDosesModel = await this.ai.trainDosesModel();
              res.write(JSON.stringify({ result: resultDosesModel }));
              break;
            }
            case ServerCommands.AI_TRAIN_EC_PH:{
              this.ai.defineEcPhModel();
              const resultEcPhModel = await this.ai.trainEcPhModel();
              res.write(JSON.stringify({ result: resultEcPhModel }));
              break;
            }

            default:
              res.write(
                JSON.stringify({
                  error: `Action "${action}" not found for page "${page}"`,
                }),
              );
              break;
          }
          break;
        }
        default: {
          res.write(JSON.stringify({ error: `Page "${page}" not found` }));
          break;
        }
      }
    } catch (err) {
      console.error("Error handling request:", err);
      res.write(JSON.stringify({ error: "Internal server error" }));
    }
    res.end();
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
              }),
            );
            await Promise.all(
              room.workers.map(async (worker) => {
                await worker.component?.setStatus(EventEmitter.start);
              }),
            );
            await Promise.all(
              room.pots.map(async (pot) => {
                await Promise.all(
                  pot.probes.map(async (probe) => {
                    await probe.component?.setStatus(EventEmitter.start);
                  }),
                );
                await Promise.all(
                  pot.workers.map(async (worker) => {
                    await worker.component?.setStatus(EventEmitter.start);
                  }),
                );
              }),
            );
          }),
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
        "system_schedule",
      )) as ExtendedCronJobInterface[];
      const scheduleArr: CronJobInterface[] = this.scheduledCrons.map(
        (systemScheduleRow) => ({
          action: systemScheduleRow.action,
          cron: `${systemScheduleRow.atMinute} ${systemScheduleRow.atHour} * * ${systemScheduleRow.atDay}`,
          operatingMode: systemScheduleRow.operatingMode,
        }),
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

  hasMethod(subject: unknown, methodName: string): boolean {
    return subject != null && typeof subject[methodName] === "function";
  }
}
