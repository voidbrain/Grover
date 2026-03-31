import * as fs from "fs";
import * as util from "util";
import process from "process";
import moment from "moment";
export class Logger {
    static setupErrorHandling() {
        const log_file_err = fs.createWriteStream("./error.log", { flags: "a" });
        const now = moment();
        process
            .on("unhandledRejection", (reason, p) => {
            console.error(reason, "Unhandled Rejection at Promise", p);
            log_file_err.write(`${now} – Unhandled Rejection at Promise: ${util.format(p)}\n`);
        })
            .on("uncaughtException", (err) => {
            console.error(err, "Uncaught Exception thrown");
            log_file_err.write(`${now} – Caught exception: ${util.format(err)}\n`);
            process.exit(1);
        });
    }
}
