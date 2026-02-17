"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tira = void 0;
class Tira {
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
exports.Tira = Tira;
//# sourceMappingURL=tira.js.map