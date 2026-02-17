import type { TiraClient } from '../client.js';
import type { SubmitPolicyRequest, SubmitPolicyResponse } from '../types/policies.js';

export class PoliciesResource {
  private client: TiraClient;

  constructor(client: TiraClient) {
    this.client = client;
  }

  async submit(data: SubmitPolicyRequest): Promise<SubmitPolicyResponse> {
    return this.client.post('/policies/submit', data);
  }
}
