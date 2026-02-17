"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiraApiError = exports.TiraError = void 0;
class TiraError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TiraError';
    }
}
exports.TiraError = TiraError;
class TiraApiError extends TiraError {
    status;
    statusText;
    constructor(status, statusText) {
        super(`Tira API error: ${status} ${statusText}`);
        this.name = 'TiraApiError';
        this.status = status;
        this.statusText = statusText;
    }
}
exports.TiraApiError = TiraApiError;
//# sourceMappingURL=errors.js.map