import { TiraClient } from "./client.js";
import { MotorResource } from "./resources/motor.js";
export class Tira {
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
        this.client = new TiraClient(config);
        this.motor = new MotorResource(this.client, config);
    }
}
//# sourceMappingURL=tira.js.map