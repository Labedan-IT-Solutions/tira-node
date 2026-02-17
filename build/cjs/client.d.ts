import type { TiraConfig } from './types/config.js';
export declare class TiraClient {
    private config;
    constructor(config: TiraConfig);
    request<T>(method: string, path: string, body?: unknown): Promise<T>;
    post<T>(path: string, body: unknown): Promise<T>;
    get<T>(path: string): Promise<T>;
}
//# sourceMappingURL=client.d.ts.map