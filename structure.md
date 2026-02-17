# Tira Node SDK — Project Structure

## File Structure

```
src/
├── types/                    # Type definitions (no logic)
│   ├── config.ts             # TiraConfig interface
│   └── policies.ts           # Policy request/response types
├── resources/                # Resource classes (API method groups)
│   └── policies.ts           # PoliciesResource
├── errors.ts                 # TiraError, TiraApiError
├── client.ts                 # TiraClient (internal HTTP client)
├── tira.ts                   # Main Tira class (glue layer)
└── index.ts                  # Public entry point (controls what users can import)
```

## How It Works

```
User code → Tira class → Resource class → TiraClient → fetch() → Your API
```

- **types/** — Shape definitions only. No runtime code.
- **client.ts** — The only file that talks to the network. Handles auth headers, JSON parsing, error throwing. Resources never call `fetch` directly.
- **resources/** — Each resource groups related API methods. Receives `TiraClient` and delegates HTTP calls to it.
- **tira.ts** — Creates the `TiraClient` and all resources. Exposes resources as `tira.resourceName`.
- **errors.ts** — Custom error classes so users can catch and inspect API errors.
- **index.ts** — Controls the public API. Only things exported here are importable from `'tira-node'`.

## Adding a New Resource

Example: adding **reinsurance**

### Step 1: Define types in `src/types/reinsurance.ts`

```ts
export interface CreateReinsuranceRequest {
  // define the fields
}

export interface CreateReinsuranceResponse {
  // define the fields
}
```

### Step 2: Create the resource class in `src/resources/reinsurance.ts`

```ts
import type { TiraClient } from '../client.js';
import type { CreateReinsuranceRequest, CreateReinsuranceResponse } from '../types/reinsurance.js';

export class ReinsuranceResource {
  private client: TiraClient;

  constructor(client: TiraClient) {
    this.client = client;
  }

  async create(data: CreateReinsuranceRequest): Promise<CreateReinsuranceResponse> {
    return this.client.post('/reinsurance', data);
  }
}
```

### Step 3: Wire it into `src/tira.ts`

```ts
import { ReinsuranceResource } from './resources/reinsurance.js';

export class Tira {
  // ...existing resources
  public readonly reinsurance: ReinsuranceResource;

  constructor(config: TiraConfig) {
    // ...existing setup
    this.reinsurance = new ReinsuranceResource(this.client);
  }
}
```

### Step 4: Export the types from `src/index.ts`

```ts
export type { CreateReinsuranceRequest, CreateReinsuranceResponse } from './types/reinsurance.js';
```

### Result

Users can now do:

```ts
import { Tira, type CreateReinsuranceRequest } from 'tira-node';

const tira = new Tira({ apiKey: 'key', baseUrl: 'https://api.tira.com' });
const result = await tira.reinsurance.create({ /* typed data */ });
```
