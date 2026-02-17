import type { TiraConfig } from './config/tira-config.js';

export class TiraClient {
  private config: TiraConfig;

  constructor(config: TiraConfig) {
    this.config = config;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`Tira API error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }
}
