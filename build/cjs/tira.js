"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tira = void 0;
const client_js_1 = require("./client.js");
const policies_js_1 = require("./resources/policies.js");
class Tira {
    client;
    policies;
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('Tira: apiKey is required');
        }
        this.client = new client_js_1.TiraClient(config);
        this.policies = new policies_js_1.PoliciesResource(this.client);
    }
}
exports.Tira = Tira;
//# sourceMappingURL=tira.js.map