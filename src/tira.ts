import type { TiraConfig } from './config/tira-config.js';
import { TiraClient } from './client.js';
import { PoliciesResource } from './resources/policies.js';

export class Tira {
  private client: TiraClient;
  public readonly policies: PoliciesResource;

  constructor(config: TiraConfig) {
    if (!config.apiKey) {
      throw new Error('Tira: apiKey is required');
    }
    this.client = new TiraClient(config);
    this.policies = new PoliciesResource(this.client);
  }
}
