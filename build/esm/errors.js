export class TiraError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TiraError';
    }
}
export class TiraApiError extends TiraError {
    status;
    statusText;
    constructor(status, statusText) {
        super(`Tira API error: ${status} ${statusText}`);
        this.name = 'TiraApiError';
        this.status = status;
        this.statusText = statusText;
    }
}
export class TiraValidationError extends TiraError {
    field;
    constructor(message, field) {
        super(message);
        this.name = 'TiraValidationError';
        this.field = field;
    }
}
//# sourceMappingURL=errors.js.map