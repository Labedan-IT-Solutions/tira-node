export class Tira {
    config;
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('Tira: apiKey is required');
        }
        this.config = config;
    }
    getConfig() {
        return this.config;
    }
}
//# sourceMappingURL=tira.js.map