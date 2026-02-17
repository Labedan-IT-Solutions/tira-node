"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliciesResource = void 0;
class PoliciesResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async submit(data) {
        return this.client.post('/policies/submit', data);
    }
}
exports.PoliciesResource = PoliciesResource;
//# sourceMappingURL=policies.js.map