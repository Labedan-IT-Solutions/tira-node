import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type { MotorCoverNotePayload, MotorCoverNoteResponse } from "../types/motor.js";
export declare class MotorResource {
    private client;
    private config;
    constructor(client: TiraClient, config: TiraConfig);
    submit(payload: MotorCoverNotePayload): Promise<MotorCoverNoteResponse>;
}
//# sourceMappingURL=motor.d.ts.map