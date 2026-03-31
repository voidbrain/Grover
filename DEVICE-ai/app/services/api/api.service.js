process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { NetworkService } from "../network/network.service";
import { SettingsService } from "../settings/settings.service";
import https from "https";
import axios from "axios";
export class ApiService {
    constructor() {
        this.url = "";
        this.settings = new SettingsService();
        this.network = new NetworkService();
    }
    init() {
        this.url =
            this.settings.getRemoteServerEndpoint() +
                "/" +
                this.settings.getPurposes()[this.settings.getPurpose()] +
                "/";
    }
    async get(endpoint, lastUpdate, action, serialNumber, port) {
        const path = `${this.settings.getRemoteServerEndpoint()}${endpoint}` +
            `?lastUpdate=${lastUpdate || ""}&action=${action || ""}` +
            `&serialNumber=${serialNumber || ""}&port=${port || ""}`;
        try {
            // Construct the URL path
            // Perform the HTTPS GET request
            const res = await this.httpsGet({
                hostname: this.settings.getRemoteServerHostname(),
                path,
            });
            // Return the result
            return res;
        }
        catch (error) {
            // Handle errors as appropriate
            console.error(`[GET] Request failed for ${path}:`, error);
            throw error;
        }
    }
    async httpsGet({ ...options }) {
        return new Promise((resolve, reject) => {
            const url = `${options.hostname}/${options.path}`;
            https
                .get(url, (resp) => {
                let data = "";
                // A chunk of data has been received.
                resp.on("data", (chunk) => {
                    data += chunk;
                });
                // The whole response has been received. Print out the result.
                resp.on("end", () => {
                    let parseJSON = {};
                    try {
                        parseJSON = JSON.parse(data);
                        resolve(parseJSON);
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            })
                .on("error", (err) => {
                console.log("[API]: Error: " + err.message);
                reject(err);
            });
        });
    }
    async post(endpont, lastUpdate, action, item, serialNumber) {
        const path = `${this.settings.getRemoteServerHostname()}/${this.settings.getRemoteServerEndpoint()}${endpont}` +
            `?lastUpdate=${lastUpdate}&action=${action}`;
        const body = { item, serialNumber };
        const res = await this.httpsPost(path, body);
        return res;
    }
    async httpsPost(path, body) {
        return new Promise((resolve, reject) => {
            axios({
                method: "POST",
                url: path,
                data: body,
            })
                .then(function (response) {
                resolve(response.data);
            })
                .catch((err) => {
                console.log("[API]: POST error", err);
                reject(err);
            });
        });
    }
    async delete(table) {
        await this.httpsDelete({
            hostname: this.settings.getRemoteServerHostname(),
            path: this.settings.getRemoteServerEndpoint() + table,
            headers: {
                Authorization: `Bearer 123`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                test1: "test",
            }),
        });
    }
    async httpsDelete({ body, ...options }) {
        return new Promise((resolve, reject) => {
            const req = https.request({
                method: "DELETE",
                ...options,
            }, (res) => {
                const chunks = [];
                res.on("data", (data) => chunks.push(data));
                res.on("end", () => {
                    let resBody = Buffer.concat(chunks);
                    switch (res.headers["content-type"]) {
                        case "application/json":
                            resBody = JSON.parse(resBody.toString());
                            break;
                    }
                    resolve(resBody);
                });
            });
            req.on("error", reject);
            if (body) {
                req.write(body);
            }
            req.end();
        });
    }
}
export default ApiService;
