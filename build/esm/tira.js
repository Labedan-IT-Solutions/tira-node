import { TiraClient } from './client.js';
import { PoliciesResource } from './resources/policies.js';
export class Tira {
    client;
    policies;
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('Tira: apiKey is required');
        }
        this.client = new TiraClient(config);
        this.policies = new PoliciesResource(this.client);
    }
}
//# sourceMappingURL=tira.js.map