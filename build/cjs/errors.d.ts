export declare class TiraError extends Error {
    constructor(message: string);
}
export declare class TiraApiError extends TiraError {
    readonly status: number;
    readonly statusText: string;
    constructor(status: number, statusText: string);
}
//# sourceMappingURL=errors.d.ts.map