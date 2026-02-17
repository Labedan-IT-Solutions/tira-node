import type { CoverNoteResponse } from "./common.js";

export interface PolicyDetail {
  /** Policy number as per insurer. String(50) */
  policy_number: string;
  /** Policy operative clauses. String(1000) */
  policy_operative_clause: string;
  /** Policy special conditions. String(1000) */
  special_conditions: string;
  /** Policy exclusions if any. Optional — defaults to "" in XML. String(1000) */
  exclusions?: string | undefined;
  /** Cover note reference numbers from previously submitted cover notes. At least one required. */
  applied_cover_notes: string[];
}

export interface PolicyPayload {
  /** Unique request identifier */
  request_id: string;
  /** Callback URL for responses (must be HTTPS) */
  callback_url: string;
  /** Insurer company code */
  insurer_company_code: string;
  /** Policy detail entries. At least one required. */
  policy_details: PolicyDetail[];
}

export type PolicyResponse = CoverNoteResponse;
