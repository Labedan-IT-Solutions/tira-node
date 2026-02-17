export class PoliciesResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async submit(data) {
        return this.client.post('/policies/submit', data);
    }
}
//# sourceMappingURL=policies.js.map