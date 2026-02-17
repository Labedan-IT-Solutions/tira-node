# Adding a New TIRA Resource to the SDK

This guide documents the architecture, patterns, and step-by-step process for adding any new TIRA resource (motor fleet, reinsurance, claims, etc.) to the SDK. It serves as a playbook so implementers don't need to rediscover patterns from scratch.

---

## SDK Architecture Overview

```
package/src/
  types/           # TypeScript interfaces for payloads, responses, config
  validation/      # Payload validation functions (throw TiraValidationError)
  builders/        # XML construction using xmlbuilder2
  resources/       # Resource classes (submit, handleCallback)
  callbacks/       # Callback parsing + signature verification
  data/            # Static reference data (countries, currencies, regions)
  __tests__/       # Vitest test files + fixtures
  tira.ts          # Main Tira class — orchestrates resources
  client.ts        # HTTP client (mTLS, XML signing, POST)
  signing.ts       # PFX-based RSA-SHA1 signing + verification
  errors.ts        # Custom error classes
  endpoints.ts     # All TIRA API endpoint paths
  utils.ts         # Shared utilities (date formatting)
  index.ts         # Public API exports
```

### Data flow for a `submit()` call:
```
User payload → validate(payload) → buildXml(payload, config) → client.postXml(endpoint, xml) → parse response → return typed result
```

### Data flow for a `handleCallback()` call:
```
Raw XML or parsed object → verifyCallbackSignature() → parseCallbackXml() → extractCallbackData() → return CallbackResult
```

---

## Reusable Components Checklist

Before writing new code, check what you can reuse:

### Types (`package/src/types/common.ts`)
- `CoverNotePayloadBase` — shared fields for all cover note payloads (request_id, callback_url, dates, premiums, policy_holders, risks_covered, etc.)
- `CoverNoteResponse` — shared acknowledgement response shape
- `TaxCharged`, `DiscountOffered`, `RisksCovered`, `SubjectMatter`, `CoverNoteAddon`, `PolicyHolder`, `MotorDetails` — reusable sub-types

**Decision: extend or pick?**
- If your payload has ALL CoverNotePayloadBase fields + extras → `extends CoverNotePayloadBase` (e.g., motor, non-life-other)
- If your payload shares SOME fields but not all → `extends Pick<CoverNotePayloadBase, 'field1' | 'field2' | ...>` (e.g., motor fleet where risks/subjects/addons are per-vehicle, not top-level)
- If your payload is completely different → create a standalone interface

### Validation (`package/src/validation/`)
- `validators.ts` — Atomic validators: `validateRequired`, `validateEnum`, `validatePositiveNumber`, `validateNumber`, `validateDateString`, `validateDateRange`, `validatePhoneNumber`, `validateEmail`, `validateHttpsUrl`, `validateTaxesCharged`
- `covernote.ts` — `validateCoverNotePayload(payload)` validates all CoverNotePayloadBase fields. Also exports array validators: `validateRisksCoveredArray`, `validateSubjectMattersArray`, `validateCoverNoteAddonsArray`, `validatePolicyHoldersArray`
- `motor.ts` — `validateMotorDetails(m, prefix)` validates MotorDetails fields

**Decision:**
- If your payload extends CoverNotePayloadBase → call `validateCoverNotePayload(payload)` first, then validate resource-specific fields
- If your payload uses Pick → call individual array validators (risks, subjects, addons, policy holders) as needed
- For motor-related resources → reuse `validateMotorDetails()`

### Builders (`package/src/builders/`)
- `covernote.ts` — `buildCoverNoteHdr(payload, config)` builds the XML header (RequestId, CompanyCode, SystemCode, etc.). Also exports: `buildRisksCoveredXml`, `buildSubjectMattersXml`, `buildCoverNoteAddonsXml`, `buildPolicyHoldersXml`, `buildCoverNoteDtl`
- `motor.ts` — `buildMotorDtlXml(m)` builds the MotorDtl XML node
- All builders use `xmlbuilder2`'s `create().ele({...}).end({ prettyPrint: false, headless: true })`

**Decision:**
- If your payload maps to the standard `CoverNoteHdr` + `CoverNoteDtl` structure → reuse `buildCoverNoteHdr` and `buildCoverNoteDtl`
- For motor-specific resources → reuse `buildMotorDtlXml()`
- For custom XML structures → reuse individual node builders (risks, subjects, addons, policy holders) and compose your own structure

### Callbacks (`package/src/callbacks/`)
- `handler.ts` — `parseCallbackXml(input)` parses XML/object into `{ body, responseTag, responseData }`. `verifyCallbackSignature(input, pfxPath, passphrase)` handles optional signature verification
- `registry.ts` — `TAG_MAP` maps XML response tags to callback types. `TAG_DISCRIMINATORS` refines types when multiple sub-types share a tag (e.g., motor vs motor_fleet). `EXTRACTORS` maps types to extraction functions. `resolveCallbackType()` and `extractCallbackData()` drive the universal handler

### Other
- `endpoints.ts` — All TIRA API paths. Check if your endpoint already exists before adding one
- `utils.ts` — `formatDateForTira(date)` converts UTC dates to GMT+3 (TIRA's timezone)
- `signing.ts` — `signContent()`, `wrapTiraMsg()` for request signing
- `errors.ts` — `TiraValidationError`, `TiraSignatureError`, `TiraApiError`

---

## Step-by-Step: Adding a New Resource

### Step 0: Study the Reference Implementation

If a reference implementation exists (e.g., in `test-folder/`), study it to understand:
1. The XML structure (root element, header, detail sections)
2. Which fields are shared with existing types and which are new
3. The TIRA response format (what tags to expect)
4. Validation rules (required fields, conditional fields, enums)

### Step 1: Add the Endpoint

**File:** `package/src/endpoints.ts`

Check if the endpoint already exists. If not, add it:
```ts
export const ENDPOINTS = {
  // ... existing
  your_new_endpoint: "/ecovernote/api/path/to/endpoint",
} as const;
```

### Step 2: Define Types

**File:** `package/src/types/<resource-name>.ts` (new file)

```ts
import type { CoverNotePayloadBase, CoverNoteResponse } from "./common.js";

// Option A: Extends full base (when all CoverNotePayloadBase fields apply)
export interface YourPayload extends CoverNotePayloadBase {
  your_specific_field: string;
}

// Option B: Pick shared fields (when only some base fields apply)
export interface YourPayload extends Pick<CoverNotePayloadBase,
  'request_id' | 'callback_url' | /* ... fields you need */
> {
  your_specific_field: string;
}

// Response is usually the same shape
export type YourResponse = CoverNoteResponse;
```

### Step 3: Create Validation

**File:** `package/src/validation/<resource-name>.ts` (new file)

```ts
import type { YourPayload } from "../types/<resource-name>.js";
import { validateRequired, validateEnum, /* ... */ } from "./validators.js";
import { validateCoverNotePayload } from "./covernote.js"; // if extending base
import { validateRisksCoveredArray, validatePolicyHoldersArray } from "./covernote.js"; // if using Pick

export function validateYourPayload(payload: YourPayload): void {
  // Option A: If extends CoverNotePayloadBase
  validateCoverNotePayload(payload);
  // Then validate resource-specific fields...

  // Option B: If uses Pick, validate each group manually
  validateRequired(payload.request_id, "request_id");
  // ... validate your specific fields
  validatePolicyHoldersArray(payload.policy_holders, "");
  validateRisksCoveredArray(payload.risks_covered, "");
}
```

### Step 4: Create Builder

**File:** `package/src/builders/<resource-name>.ts` (new file)

```ts
import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { YourPayload } from "../types/<resource-name>.js";
import { buildCoverNoteHdr } from "./covernote.js";

export function buildYourXml(payload: YourPayload, config: TiraConfig): string {
  return create({ version: "1.0" })
    .ele({
      YourRootElement: {
        CoverNoteHdr: buildCoverNoteHdr(payload, config),
        CoverNoteDtl: {
          // Use shared builders or build custom structure
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
```

**Key patterns:**
- Dates: use `formatDateForTira(date)` from `utils.ts` (converts UTC to GMT+3)
- Monetary values: `.toFixed(2)` for amounts, `.toFixed(5)` for rates
- Optional fields: use `?? ""` for empty string defaults
- Booleans/enums: pass as strings (`"1"`, `"Y"`, etc.)

### Step 5: Create Resource Class

**File:** `package/src/resources/<resource-name>.ts` (new file)

Follow the pattern from `motor.ts` or `non-life-other.ts`:

```ts
import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type { YourPayload, YourResponse } from "../types/<resource-name>.js";
import type { CallbackResult } from "../types/callback.js";
import { validateYourPayload } from "../validation/<resource-name>.js";
import { buildYourXml } from "../builders/<resource-name>.js";
import { parseCallbackXml, verifyCallbackSignature } from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class YourResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(payload: YourPayload): Promise<YourResponse> {
    validateYourPayload(payload);
    const xml = buildYourXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.your_endpoint,
      xml,
    );
    const ack = raw?.["TiraMsg"]?.["YourAckTag"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: { YourAckTag: ack },
    };
  }

  async handleCallback(input: string | Record<string, any>): Promise<CallbackResult> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );
    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData("your_type", responseData);
    return {
      type: "your_type",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
```

### Step 6: Register Callback Type

**File:** `package/src/callbacks/registry.ts`

There are two scenarios: your resource has a **new unique response tag**, or it **shares a tag** with an existing resource.

#### Scenario A: New Unique Response Tag

If TIRA sends a new/different response tag for your resource's async callback:

```ts
const TAG_MAP: Record<string, string> = {
  MotorCoverNoteRefRes: "motor",
  CoverNoteRefRes: "non_life_other",
  YourResponseTag: "your_type", // Add this
};

const EXTRACTORS: Record<string, ...> = {
  motor: extractMotorCallback,
  non_life_other: extractNonLifeOtherCallback,
  your_type: extractYourCallback, // Add this
};

function extractYourCallback(data: Record<string, any>): YourCallbackResponse {
  return {
    response_id: data.ResponseId ?? "",
    request_id: data.RequestId ?? "",
    // ... map fields
  };
}
```

#### Scenario B: Shared Response Tag (TAG_DISCRIMINATORS Pattern)

If your resource shares the same XML response tag as an existing resource but has a different internal structure, use the **TAG_DISCRIMINATORS** pattern. This inspects the response data to refine the type.

**Real example:** Motor fleet callbacks use the same `MotorCoverNoteRefRes` tag as regular motor, but contain `FleetResHdr` + `FleetResDtl[]` instead of flat fields.

```ts
// 1. Add a discriminator function for the shared tag
const TAG_DISCRIMINATORS: Record<string, (data: Record<string, any>) => string | undefined> = {
  MotorCoverNoteRefRes: (data) => {
    // Fleet callbacks have FleetResHdr; regular motor does not
    if (data.FleetResHdr) return "motor_fleet";
    return undefined; // fall through to TAG_MAP default ("motor")
  },
};
```

**How it works:**
1. `resolveCallbackType(responseTag, responseData)` first checks `TAG_DISCRIMINATORS[responseTag]`
2. If a discriminator exists, it calls it with the response data
3. If the discriminator returns a string → that's the refined type (e.g., `"motor_fleet"`)
4. If the discriminator returns `undefined` → falls through to `TAG_MAP` default (e.g., `"motor"`)

**When to use this pattern:**
- TIRA sends the same XML root tag for multiple resource types
- The internal structure differs (e.g., fleet has `FleetResHdr`, regular motor does not)
- You need to route to different extractors based on data shape

**Steps to add a new discriminator:**
1. Identify a unique field in the response data that distinguishes your sub-type
2. Add or extend a discriminator function in `TAG_DISCRIMINATORS`
3. Add an extractor function in `EXTRACTORS` for your refined type
4. Add your type to `EnabledCallbacks` in `types/callback.ts`
5. Handle xml2js quirks: single child → object, multiple children → array. Normalize with:
   ```ts
   const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
   ```

This pattern is designed to be reusable for any future scenario where TIRA uses the same response tag for different resource types.

### Step 7: Add Callback Response Type (if new)

**File:** `package/src/types/callback.ts`

```ts
export interface YourCallbackResponse {
  response_id: string;
  request_id: string;
  // ... fields from the async callback
}

export interface EnabledCallbacks {
  motor?: boolean | undefined;
  non_life_other?: boolean | undefined;
  your_type?: boolean | undefined; // Add this
}
```

### Step 8: Integrate into Tira Class

**File:** `package/src/tira.ts`

```ts
import { YourResource } from "./resources/<resource-name>.js";

export class Tira {
  // ... existing
  public readonly yourResource: YourResource;

  constructor(config: TiraConfig) {
    // ... existing validation and setup
    this.yourResource = new YourResource(this.client, config);
  }
}
```

### Step 9: Export from Index

**File:** `package/src/index.ts`

```ts
export type {
  YourPayload,
  YourResponse,
} from "./types/<resource-name>.js";
```

### Step 10: Write Tests

#### Test Fixtures (`package/src/__tests__/fixtures.ts`)
Add a valid payload object for your resource.

#### Validation Tests (`package/src/__tests__/<resource>-validation.test.ts`)
Test pattern:
- Valid complete payload passes
- Each required field: throws TiraValidationError when missing/empty
- Enum fields: throws on invalid values
- Conditional fields: throws when conditions met but value missing
- Array fields: throws when empty
- Date validation: end date before start date
- Phone/email format validation

#### Builder Tests (`package/src/__tests__/<resource>-builder.test.ts`)
Test pattern:
- Produces valid XML (parseable by xml2js)
- Root element is correct tag
- CoverNoteHdr contains config values
- Premium values formatted with .toFixed(2)
- Dates converted to GMT+3
- Optional fields default correctly (currency_code → TZS, exchange_rate → 1.00)
- Output is headless (no XML declaration)

#### Integration Test in `tira.test.ts`
- `tira.yourResource` is defined after construction

### Step 11: Build and Test

```bash
npm run build   # Verify ESM + CJS output clean
npm test        # All existing + new tests pass
```

---

## Common Patterns and Considerations

### XML Structure Mapping
TIRA XML uses PascalCase tags. The SDK uses snake_case for TypeScript properties. The builder maps between them:
- `request_id` → `<RequestId>`
- `total_premium_excluding_tax` → `<TotalPremiumExcludingTax>`
- `motor_details.chassis_number` → `<MotorDtl><ChassisNumber>`

### Number Formatting
- **Monetary amounts**: `.toFixed(2)` — e.g., `525000.00`
- **Rates** (premium, tax, discount, commission): `.toFixed(5)` — e.g., `0.03500`
- **Whole numbers** (fleet_size, year_of_manufacture): pass as-is

### Date Handling
TIRA expects dates in GMT+3 (East Africa Time) without timezone suffix:
```
Input:  "2025-05-31T21:00:00Z" (UTC)
Output: "2025-06-01T00:00:00"  (GMT+3, no Z, no milliseconds)
```
Always use `formatDateForTira()` from `utils.ts`.

### Optional Fields
- Use `?? ""` for string defaults (empty string, not undefined)
- Use `?? "0"` or `?? "0.00"` for optional numeric fields that must have a value in XML
- Commission fields default to empty string when not provided (not "0.00")

### Error Handling
- Validation errors: throw `TiraValidationError(message, fieldName)` — caught by SDK users
- API errors: `TiraApiError` (thrown by client.ts)
- Signature errors: `TiraSignatureError` (thrown by verification)

### Callback Registration
The universal `Tira.handleCallback()` uses a registry-based system:
1. `parseCallbackXml()` finds the response tag (e.g., `MotorCoverNoteRefRes`)
2. `resolveCallbackType(responseTag, responseData)` first checks `TAG_DISCRIMINATORS` to refine the type based on data shape, then falls back to `TAG_MAP` for tag → type mapping
3. `extractCallbackData()` maps type → extractor function
4. `enabled_callbacks` config controls which types are allowed

If your resource shares a response tag with another resource but has a different internal structure, use the **TAG_DISCRIMINATORS pattern** (see Step 6, Scenario B above). This inspects the response data to distinguish sub-types sharing the same tag.

### Mocking in Tests
The SDK mocks `node:fs`, `node:https`, and `../signing.js` in test files because the Tira constructor reads cert files. Follow the same mock pattern:
```ts
vi.mock("node:fs", () => ({
  readFileSync: vi.fn(() => Buffer.from("mock-cert-content")),
}));
vi.mock("node:https", () => ({ Agent: vi.fn(), request: vi.fn() }));
vi.mock("../signing.js", () => ({
  signContent: vi.fn(() => "mock-signature"),
  wrapTiraMsg: vi.fn((c, s) => `<TiraMsg>\n${c}\n<MsgSignature>${s}</MsgSignature>\n</TiraMsg>`),
  extractSignedContentAndSignature: vi.fn(() => ({ contentXml: "mock", base64Signature: "sig" })),
  verifySignature: vi.fn(() => true),
}));
```

### When to Extract Helpers
If you find yourself duplicating validation/builder logic that's identical to an existing resource, extract a shared helper into `validation/covernote.ts` or `builders/covernote.ts` and call it from both places. This has already been done for:
- Risks, subjects, addons, policy holders (validation + builders)
- Motor details (validation + builder)
- Cover note header (builder)

---

## Existing Resources Reference

| Resource | Type File | Validation | Builder | Resource Class | Endpoint |
|----------|-----------|------------|---------|----------------|----------|
| Motor | `types/motor.ts` | `validation/motor.ts` | `builders/motor.ts` | `resources/motor.ts` | `covernote_motor` |
| Non-Life Other | `types/non-life-other.ts` | `validation/non-life-other.ts` | `builders/non-life-other.ts` | `resources/non-life-other.ts` | `covernote_other` |
| Motor Fleet | `types/motor-fleet.ts` | `validation/motor-fleet.ts` | `builders/motor-fleet.ts` | `resources/motor-fleet.ts` | `covernote_motor_fleet` |

### Endpoints Already Defined (in `endpoints.ts`)
```
covernote_motor, covernote_motor_fleet, motor_verification,
covernote_other, shortterm_covernote, longterm_covernote,
covernote_verification, policy_submission,
reinsurance_submission,
claim_notification, claim_intimation, claim_assessment,
discharge_voucher, claim_payment, claim_rejection
```
