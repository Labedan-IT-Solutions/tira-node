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
- `CoverNoteResponse` — shared acknowledgement response shape (used by all async resources)
- `SimpleClaimant` — shared 4-field claimant type (claimant_category, claimant_type, claimant_id_number, claimant_id_type). Used by claim-intimation, claim-assessment, discharge-voucher, claim-payment, claim-rejection
- `TaxCharged`, `DiscountOffered`, `RisksCovered`, `SubjectMatter`, `CoverNoteAddon`, `PolicyHolder`, `MotorDetails` — reusable sub-types

**Decision: extend, pick, or standalone?**
- If your payload has ALL CoverNotePayloadBase fields + extras → `extends CoverNotePayloadBase` (e.g., motor, non-life-other)
- If your payload shares SOME fields but not all → `extends Pick<CoverNotePayloadBase, 'field1' | 'field2' | ...>` (e.g., motor fleet where risks/subjects/addons are per-vehicle, not top-level)
- If your payload is completely different → create a standalone interface (e.g., claim resources with their own header/detail structure)

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
- `extractBaseCallback` — shared extractor for the standard 4-field callback response. Used by 7 of 12 resources. Only write a custom extractor if your callback has extra fields

### Callback Types (`package/src/types/callback.ts`)
- `BaseCallbackResponse` — shared interface with 4 fields: response_id, request_id, response_status_code, response_status_desc
- Most callback response types are just `type YourCallbackResponse = BaseCallbackResponse` (type alias)
- Types with extra fields extend `BaseCallbackResponse` (motor, non_life_other, claim_notification)

### Other
- `endpoints.ts` — All TIRA API paths. Check if your endpoint already exists before adding one
- `utils.ts` — `formatDateForTira(date)` converts UTC dates to GMT+3 (TIRA's timezone)
- `signing.ts` — `signContent()`, `wrapTiraMsg()` for request signing
- `builders/acknowledgement.ts` — `buildAckPayload()`, `buildAcknowledgementXml()` for building TIRA acknowledgements. Used by `Tira.acknowledge()`
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

There are three scenarios depending on your callback's response shape and XML tag.

#### Scenario A: Standard 4-Field Callback (Most Common)

Most TIRA callbacks return the same 4 fields (ResponseId, RequestId, ResponseStatusCode, ResponseStatusDesc). In this case, reuse the shared `extractBaseCallback` function — no custom extractor needed:

```ts
const TAG_MAP: Record<string, string> = {
  // ... existing
  YourResponseTag: "your_type", // Add this
};

const EXTRACTORS: Record<string, ...> = {
  // ... existing
  your_type: extractBaseCallback, // Reuse shared extractor
};
```

This pattern is used by: reinsurance, policy, claim_intimation, claim_assessment, discharge_voucher, claim_payment, claim_rejection.

#### Scenario B: Custom Callback Fields

If your callback has extra fields beyond the standard 4, write a custom extractor that spreads `extractBaseCallback`:

```ts
function extractYourCallback(data: Record<string, any>): YourCallbackResponse {
  return {
    ...extractBaseCallback(data),
    your_extra_field: data.YourExtraField ?? "",
  };
}
```

This pattern is used by: motor (+ covernote_reference_number, sticker_number), non_life_other (+ covernote_reference_number), claim_notification (+ claim_reference_number).

#### Scenario C: Shared Response Tag (TAG_DISCRIMINATORS Pattern)

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

### Step 7: Add Callback Response Type

**File:** `package/src/types/callback.ts`

For standard 4-field callbacks, use a type alias of `BaseCallbackResponse`:
```ts
// Standard callback — just a type alias (most resources)
export type YourCallbackResponse = BaseCallbackResponse;
```

For callbacks with extra fields, extend `BaseCallbackResponse`:
```ts
// Custom callback — extends base with extra fields
export interface YourCallbackResponse extends BaseCallbackResponse {
  your_extra_field: string;
}
```

Add your type to `EnabledCallbacks`:
```ts
export interface EnabledCallbacks {
  motor?: boolean | undefined;
  motor_fleet?: boolean | undefined;
  non_life_other?: boolean | undefined;
  reinsurance?: boolean | undefined;
  policy?: boolean | undefined;
  claim_notification?: boolean | undefined;
  claim_intimation?: boolean | undefined;
  claim_assessment?: boolean | undefined;
  discharge_voucher?: boolean | undefined;
  claim_payment?: boolean | undefined;
  claim_rejection?: boolean | undefined;
  your_type?: boolean | undefined; // Add this
}
```

### Step 8: Integrate into Tira Class

**File:** `package/src/tira.ts`

```ts
import { YourResource } from "./resources/<resource-name>.js";

export class Tira {
  // ... existing resources
  public readonly yourResource: YourResource;

  constructor(config: TiraConfig) {
    // ... existing validation and setup
    this.yourResource = new YourResource(this.client, config);
  }

  // The Tira class also provides:
  // - handleCallback(input) — universal callback handler using registry
  // - acknowledge(parsedBody, acknowledgementId) — builds signed ack XML
}
```

### Step 9: Export from Index

**File:** `package/src/index.ts`

```ts
// Add payload/response types
export type {
  YourPayload,
  YourResponse,
} from "./types/<resource-name>.js";

// Add callback response type to the existing callback exports block
export type {
  // ... existing
  YourCallbackResponse,
} from "./types/callback.js";
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

#### Integration Tests in `tira.test.ts`
- `tira.yourResource` is defined after construction
- Callback returns correct type when enabled
- Callback throws when not enabled
- `raw_xml` populated for XML string input, empty for pre-parsed object input

Add callback fixture data to `fixtures.ts`:
- `sampleYourCallbackXml` — raw XML string
- `sampleYourCallbackParsed` — pre-parsed JS object (same structure as xml2js output)

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
- `SimpleClaimant` (shared type in `types/common.ts` used by 5 claim resources)
- `BaseCallbackResponse` + `extractBaseCallback` (shared callback type + extractor used by 7 resources)

---

## Existing Resources Reference (All 12 Complete)

| Resource | Accessor | Type File | Endpoint | Ack Tag | Callback Tag |
|----------|----------|-----------|----------|---------|--------------|
| Motor | `tira.motor` | `types/motor.ts` | `covernote_motor` | `MotorCoverNoteRefReqAck` | `MotorCoverNoteRefRes` |
| Motor Fleet | `tira.motorFleet` | `types/motor-fleet.ts` | `covernote_motor_fleet` | `MotorCoverNoteRefReqAck` | `MotorCoverNoteRefRes`* |
| Non-Life Other | `tira.nonLifeOther` | `types/non-life-other.ts` | `covernote_other` | `CoverNoteRefReqAck` | `CoverNoteRefRes` |
| Reinsurance | `tira.reinsurance` | `types/reinsurance.ts` | `reinsurance_submission` | `ReinsuranceReqAck` | `ReinsuranceRes` |
| Policy | `tira.policy` | `types/policy.ts` | `policy_submission` | `PolicyReqAck` | `PolicyRes` |
| Claim Notification | `tira.claimNotification` | `types/claim-notification.ts` | `claim_notification` | `ClaimNotificationRefReqAck` | `ClaimNotificationRefRes` |
| Cover Note Verification | `tira.coverNoteVerification` | `types/covernote-verification.ts` | `covernote_verification` | — (sync) | — (sync) |
| Claim Intimation | `tira.claimIntimation` | `types/claim-intimation.ts` | `claim_intimation` | `ClaimIntimationReqAck` | `ClaimIntimationRes` |
| Claim Assessment | `tira.claimAssessment` | `types/claim-assessment.ts` | `claim_assessment` | `ClaimAssessmentReqAck` | `ClaimAssessmentRes` |
| Discharge Voucher | `tira.dischargeVoucher` | `types/discharge-voucher.ts` | `discharge_voucher` | `DischargeVoucherReqAck` | `DischargeVoucherRes` |
| Claim Payment | `tira.claimPayment` | `types/claim-payment.ts` | `claim_payment` | `ClaimPaymentReqAck` | `ClaimPaymentRes` |
| Claim Rejection | `tira.claimRejection` | `types/claim-rejection.ts` | `claim_rejection` | `ClaimRejectionReqAck` | `ClaimRejectionRes` |

\*Motor Fleet shares the `MotorCoverNoteRefRes` callback tag with Motor — discriminated by `FleetResHdr` field presence via `TAG_DISCRIMINATORS`.

Each resource follows the same file naming pattern: `types/<name>.ts`, `validation/<name>.ts`, `builders/<name>.ts`, `resources/<name>.ts`. Exception: Cover Note Verification is sync (has `verify()` instead of `submit()`, no callback handling).

### Callback Response Types

| Pattern | Callback Type | Resources |
|---------|--------------|-----------|
| `BaseCallbackResponse` (type alias) | Standard 4 fields | reinsurance, policy, claim_intimation, claim_assessment, discharge_voucher, claim_payment, claim_rejection |
| `extends BaseCallbackResponse` | Extra fields | motor (+covernote_reference_number, +sticker_number), non_life_other (+covernote_reference_number), claim_notification (+claim_reference_number) |
| Custom structure | Unique shape | motor_fleet (FleetResHdr + FleetResDtl[]) |

### Endpoints Already Defined (in `endpoints.ts`)
```
covernote_motor, covernote_motor_fleet, motor_verification,
covernote_other, shortterm_covernote, longterm_covernote,
covernote_verification, policy_submission,
reinsurance_submission,
claim_notification, claim_intimation, claim_assessment,
discharge_voucher, claim_payment, claim_rejection
```
