"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiraValidationError = exports.TiraApiError = exports.TiraError = void 0;
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
class TiraValidationError extends TiraError {
    field;
    constructor(message, field) {
        super(message);
        this.name = 'TiraValidationError';
        this.field = field;
    }
}
exports.TiraValidationError = TiraValidationError;
//# sourceMappingURL=errors.js.map