import type { TiraConfig } from "./types/config.js";
export declare class TiraClient {
    private config;
    private agent;
    constructor(config: TiraConfig);
    postXml<T>(endpoint: string, xmlBody: string): Promise<T>;
}
//# sourceMappingURL=client.d.ts.map