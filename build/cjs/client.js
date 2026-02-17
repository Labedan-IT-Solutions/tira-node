"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiraClient = void 0;
const https = require("node:https");
const fs = require("node:fs");
const xml2js_1 = require("xml2js");
const errors_js_1 = require("./errors.js");
const signing_js_1 = require("./signing.js");
class TiraClient {
    config;
    agent;
    constructor(config) {
        this.config = config;
        this.agent = new https.Agent({
            key: fs.readFileSync(config.client_key_path),
            cert: fs.readFileSync(config.client_cert_path),
            ca: fs.readFileSync(config.ca_cert_path),
            rejectUnauthorized: false,
        });
    }
    async postXml(endpoint, xmlBody) {
        const url = new URL(endpoint, this.config.base_url);
        console.log(url);
        // Sign and wrap the XML
        const signature = (0, signing_js_1.signContent)(xmlBody, this.config.pfx_path, this.config.pfx_passphrase);
        const wrappedXml = (0, signing_js_1.wrapTiraMsg)(xmlBody, signature);
        const headers = {
            "Content-Type": "application/xml",
            ClientCode: this.config.client_code,
            ClientKey: this.config.client_key,
        };
        // Verification endpoints use Basic Auth
        if (endpoint.toLowerCase().includes("/verification/")) {
            const basicAuth = Buffer.from(`${this.config.client_code}:${this.config.client_key}`).toString("base64");
            headers["Authorization"] = `Basic ${basicAuth}`;
        }
        const responseText = await new Promise((resolve, reject) => {
            const req = https.request(url, {
                method: "POST",
                headers,
                agent: this.agent,
            }, (res) => {
                const chunks = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => {
                    const body = Buffer.concat(chunks).toString("utf-8");
                    if (res.statusCode &&
                        (res.statusCode < 200 || res.statusCode >= 300)) {
                        reject(new errors_js_1.TiraApiError(res.statusCode, res.statusMessage ?? "Unknown error"));
                        return;
                    }
                    resolve(body);
                });
                res.on("error", reject);
            });
            req.on("error", reject);
            req.write(wrappedXml);
            req.end();
        });
        const parsed = await (0, xml2js_1.parseStringPromise)(responseText, {
            explicitArray: false,
        });
        return parsed;
    }
}
exports.TiraClient = TiraClient;
//# sourceMappingURL=client.js.map