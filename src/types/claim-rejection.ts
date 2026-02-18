import type { CoverNoteResponse, SimpleClaimant } from "./common.js";

export interface ClaimRejectionPayload {
  /** Unique request identifier */
  request_id: string;
  /** Callback URL for responses */
  callback_url: string;
  /** Insurer company code */
  insurer_company_code: string;
  /** Claim rejection number. String(50) */
  claim_rejection_number: string;
  /** Claim reference number. String(50) */
  claim_reference_number: string;
  /** Claim intimation number. String(50) */
  claim_intimation_number: string;
  /** Cover note reference number. String(50) */
  covernote_reference_number: string;
  /** Rejection date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  rejection_date: string | Date;
  /** Rejection reason. String(100) */
  rejection_reason: string;
  /** Whether claim resulted in litigation: Y-Yes, N-No */
  claim_resulted_litigation: "Y" | "N";
  /** Claim amount. Numeric(36,2) */
  claim_amount: number;
  /** ISO 4217 currency code. String(3) */
  currency_code: string;
  /** Exchange rate. Numeric(36,2) */
  exchange_rate: number;
  /** Claimant details. At least one claimant required. */
  claimants: SimpleClaimant[];
}

export type ClaimRejectionResponse = CoverNoteResponse;
