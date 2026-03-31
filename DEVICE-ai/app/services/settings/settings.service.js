import { exec } from "child_process";
import { Purposes } from "./enums";
export class SettingsService {
    constructor() {
        this.locales = ["en", "it"];
        this.appName = "Grover/RedNeck";
        this.remoteServerHostname = "https://www.voidbrain.net";
        this.remoteServerEndpoint = "temp/grover/ajax/moduli/api/worker/";
        this.purposes = ["client", "worker"];
        this.purpose = Purposes.worker;
        this.operatingMode = null;
        this.logMode = true;
        this.datatables = [
            "calendar_doses",
            "calendar_phases",
            "calendars",
            "locations",
            "operating_modes",
            "rooms",
            "plants",
            "pots",
            "probes_list",
            // 'probes_log',
            "probes_schedule",
            "probes_type",
            "settings",
            // 'system_log',
            "system_schedule",
            "workers_list",
            // 'workers_log',
            "workers_schedule",
            "workers_type",
        ];
        this.mainClockInterval = 5 * 1000; // ms
    }
    getLocales() {
        return this.locales;
    }
    getClockInterval() {
        return this.mainClockInterval;
    }
    getAppName() {
        return this.appName;
    }
    getPurposes() {
        return this.purposes;
    }
    getTables() {
        return this.datatables;
    }
    getPurpose() {
        return this.purpose;
    }
    getLogMode() {
        return this.logMode;
    }
    setLogMode(mode) {
        this.logMode = mode;
    }
    getOperatingMode() {
        return this.operatingMode;
    }
    setOperatingMode(mode) {
        this.operatingMode = mode;
    }
    getRemoteServerHostname() {
        return this.remoteServerHostname;
    }
    getRemoteServerEndpoint() {
        return this.remoteServerEndpoint;
    }
    async getSerialNumber() {
        return new Promise((resolve) => {
            exec("cat /proc/cpuinfo | grep Serial", (error, stdout, stderr) => {
                if (stderr) {
                    resolve({ found: false, sn: "10000000ce6b74fc" });
                }
                else {
                    const sn = stdout.split(": ")[1].trim();
                    resolve({ found: true, sn: sn });
                }
            });
        });
    }
}
export default SettingsService;
