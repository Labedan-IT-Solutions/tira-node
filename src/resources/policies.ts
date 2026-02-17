import type { TiraClient } from '../client.js';

export class PoliciesResource {
  private client: TiraClient;

  constructor(client: TiraClient) {
    this.client = client;
  }

  async submit(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.post('/policies/submit', data);
  }
}
