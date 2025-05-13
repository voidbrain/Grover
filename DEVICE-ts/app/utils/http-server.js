import http from "http";
import url from "url";
import moment from "moment";
import schedule from "node-schedule";
import { EventEmitter, OperatingModes, ServerCommands, ServerPages, } from "../../app/services/settings/enums";
export class WebServer {
    constructor(settings, db, api, ai, rooms) {
        this.settings = settings;
        this.db = db;
        this.api = api;
        this.ai = ai;
        this.rooms = rooms;
        this.debug = true;
        this.pots = [];
        this.scheduledCrons = [];
    }
    async init() {
        this.serialNumber = await this.settings.getSerialNumber();
        this.server = http.createServer(this.handleRequest.bind(this));
        this.server.listen(8084, () => {
            console.log(`Server running at http://localhost:8084/`);
        });
        this.pots = this.rooms[0].pots;
        return this.server;
    }
    async handleRequest(req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
        res.setHeader("Access-Control-Max-Age", 2592000);
        res.writeHead(200, { "Content-Type": "text/plain" });
        const q = url.parse(req.url, true);
        if (q.pathname === "/favicon.ico") {
            res.writeHead(200, { "Content-Type": "image/x-icon" });
            res.end();
            return;
        }
        const action = q.query.action;
        const page = q.pathname;
        const emitter = EventEmitter.user;
        const operatingMode = this.settings.getOperatingMode();
        const now = moment();
        try {
            switch (page) {
                case `/${ServerPages.actuators}`: {
                    const id = q.query.id;
                    const terminalType = q.query.type;
                    if (action && id && terminalType) {
                        const duration = q.query.duration ? +q.query.duration : 0;
                        const terminal = (await this.db.getItem(terminalType + "s_list", +id, "id"));
                        const locationId = "locationId" in terminal ? terminal?.locationId : 0;
                        const parentLocation = (await this.db.getItem("locations", +locationId, "id"));
                        const parent = (await this.db.findParent(parentLocation.id));
                        const environments = +parent.parent > 0 ? this.pots : this.rooms;
                        const environmentType = +parent.parent > 0 ? "pot" : "room";
                        const environment = environments.find((el) => +el[environmentType].locationId ===
                            +parent[`${environmentType}LocationId`]);
                        if (environment) {
                            if (terminalType + "s" in environment) {
                                const el = environment[terminalType + "s"].find((el) => +el[`id`] === +id);
                                if (el) {
                                    const hasMethod = this.hasMethod(el.component, action);
                                    if (hasMethod) {
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
                                    }
                                    else {
                                        if (this.debug) {
                                            console.log("[SERVER]: ##################");
                                            console.log(`[SERVER]: Action ${action} not found`);
                                            console.log("[SERVER]: ", el.component);
                                            console.log("[SERVER]: ##################");
                                        }
                                        res.write(JSON.stringify({
                                            error: `[SERVER]: Action ${action} not found`,
                                        }));
                                    }
                                }
                                else {
                                    if (this.debug) {
                                        console.log(`[SERVER]: Error el.component not found`);
                                    }
                                    res.write(JSON.stringify({
                                        error: `[SERVER]: Error el.component not found`,
                                    }));
                                }
                            }
                            else {
                                if (this.debug) {
                                    console.log(`[SERVER]: Error terminalType in env not found`);
                                }
                                res.write(JSON.stringify({
                                    error: `[SERVER]: Error terminalType in env not found`,
                                }));
                            }
                        }
                        else {
                            const err = `[SERVER]: environment not found LIST: [${environments.map((el) => el[environmentType].id)}], ? = ${parent.id}`;
                            if (this.debug) {
                                console.log("[SERVER]: ", err);
                            }
                            res.write(JSON.stringify({ error: err }));
                        }
                    }
                    else {
                        if (this.debug) {
                            console.log(`[SERVER]: Error ${action}, ${id}, ${terminalType}`);
                        }
                        res.write(JSON.stringify({
                            error: `Error ${action}, ${id}, ${terminalType}`,
                        }));
                    }
                    break;
                }
                case `/${ServerPages.system}`: {
                    switch (action) {
                        case ServerCommands.SET_MODE: {
                            const mode = +q.query.type;
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
                        case ServerCommands.AI_TRAIN_EC_PH: {
                            this.ai.defineEcPhModel();
                            const resultEcPhModel = await this.ai.trainEcPhModel();
                            res.write(JSON.stringify({ result: resultEcPhModel }));
                            break;
                        }
                        default:
                            res.write(JSON.stringify({
                                error: `Action "${action}" not found for page "${page}"`,
                            }));
                            break;
                    }
                    break;
                }
                default: {
                    res.write(JSON.stringify({ error: `Page "${page}" not found` }));
                    break;
                }
            }
        }
        catch (err) {
            console.error("Error handling request:", err);
            res.write(JSON.stringify({ error: "Internal server error" }));
        }
        res.end();
    }
    async updateOperatingMode(mode) {
        try {
            if (Object.values(OperatingModes).includes(mode)) {
                this.settings.setOperatingMode(mode);
                await Promise.all(this.rooms.map(async (room) => {
                    await Promise.all(room.probes.map(async (probe) => {
                        await probe.component?.setStatus(EventEmitter.start);
                    }));
                    await Promise.all(room.workers.map(async (worker) => {
                        await worker.component?.setStatus(EventEmitter.start);
                    }));
                    await Promise.all(room.pots.map(async (pot) => {
                        await Promise.all(pot.probes.map(async (probe) => {
                            await probe.component?.setStatus(EventEmitter.start);
                        }));
                        await Promise.all(pot.workers.map(async (worker) => {
                            await worker.component?.setStatus(EventEmitter.start);
                        }));
                    }));
                }));
                return mode;
            }
            else {
                return false;
            }
        }
        catch (err) {
            console.error("Error in updateOperatingMode method:", err);
            return false;
        }
    }
    async setMainSchedule() {
        try {
            this.scheduledCrons = (await this.db.getItems("system_schedule"));
            const scheduleArr = this.scheduledCrons.map((systemScheduleRow) => ({
                action: systemScheduleRow.action,
                cron: `${systemScheduleRow.atMinute} ${systemScheduleRow.atHour} * * ${systemScheduleRow.atDay}`,
                operatingMode: systemScheduleRow.operatingMode,
            }));
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
        }
        catch (err) {
            console.error("Error in setMainSchedule method:", err);
        }
    }
    hasMethod(subject, methodName) {
        return subject != null && typeof subject[methodName] === "function";
    }
}
