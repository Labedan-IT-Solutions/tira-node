"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tira = void 0;
const client_js_1 = require("./client.js");
const motor_js_1 = require("./resources/motor.js");
class Tira {
    client;
    motor;
    constructor(config) {
        if (!config.client_code) {
            throw new Error("Tira: client_code is required");
        }
        if (!config.client_key) {
            throw new Error("Tira: client_key is required");
        }
        if (!config.system_code) {
            throw new Error("Tira: system_code is required");
        }
        if (!config.transacting_company_code) {
            throw new Error("Tira: transacting_company_code is required");
        }
        if (!config.base_url) {
            throw new Error("Tira: base_url is required");
        }
        if (!config.client_cert_path) {
            throw new Error("Tira: client_cert_path is required");
        }
        if (!config.client_key_path) {
            throw new Error("Tira: client_key_path is required");
        }
        if (!config.ca_cert_path) {
            throw new Error("Tira: ca_cert_path is required");
        }
        if (!config.pfx_path) {
            throw new Error("Tira: pfx_path is required");
        }
        if (!config.pfx_passphrase) {
            throw new Error("Tira: pfx_passphrase is required");
        }
        this.client = new client_js_1.TiraClient(config);
        this.motor = new motor_js_1.MotorResource(this.client, config);
    }
}
exports.Tira = Tira;
//# sourceMappingURL=tira.js.map