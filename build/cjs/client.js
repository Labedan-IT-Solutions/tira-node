"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiraClient = void 0;
class TiraClient {
    config;
    constructor(config) {
        this.config = config;
    }
    async request(method, path, body) {
        const url = `${this.config.baseUrl}${path}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const res = await fetch(url, options);
        if (!res.ok) {
            throw new Error(`Tira API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
    }
    post(path, body) {
        return this.request('POST', path, body);
    }
    get(path) {
        return this.request('GET', path);
    }
}
exports.TiraClient = TiraClient;
//# sourceMappingURL=client.js.map