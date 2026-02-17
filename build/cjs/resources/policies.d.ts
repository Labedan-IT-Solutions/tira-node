import type { TiraClient } from '../client.js';
import type { SubmitPolicyRequest, SubmitPolicyResponse } from '../types/policies.js';
export declare class PoliciesResource {
    private client;
    constructor(client: TiraClient);
    submit(data: SubmitPolicyRequest): Promise<SubmitPolicyResponse>;
}
//# sourceMappingURL=policies.d.ts.map