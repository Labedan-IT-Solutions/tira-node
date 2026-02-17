import type { CoverNoteResponse, SimpleClaimant } from "./common.js";

/** @deprecated Use SimpleClaimant instead */
export type AssessmentClaimant = SimpleClaimant;

export interface ClaimAssessmentPayload {
  /** Unique request identifier */
  request_id: string;
  /** Callback URL for responses (must be HTTPS) */
  callback_url: string;
  /** Insurer company code */
  insurer_company_code: string;
  /** Claim assessment number. String(50) */
  claim_assessment_number: string;
  /** Claim intimation number. String(50) */
  claim_intimation_number: string;
  /** Claim reference number. String(50) */
  claim_reference_number: string;
  /** Cover note reference number. String(50) */
  covernote_reference_number: string;
  /** Assessment received date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  assessment_received_date: string | Date;
  /** Assessment report summary. String(1000) */
  assessment_report_summary: string;
  /** ISO 4217 currency code. Defaults to TZS. */
  currency_code?: string | undefined;
  /** Exchange rate. Defaults to 1.0. */
  exchange_rate?: number | undefined;
  /** Assessment amount. Numeric(36,2) */
  assessment_amount: number;
  /** Approved claim amount. Numeric(36,2) */
  approved_claim_amount: number;
  /** Claim approval date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  claim_approval_date: string | Date;
  /** Claim approval authority. String(100) */
  claim_approval_authority: string;
  /** Is this a re-assessment: Y-Yes, N-No */
  is_re_assessment: "Y" | "N";
  /** Assessment claimant details. At least one claimant required. */
  claimants: SimpleClaimant[];
}

export type ClaimAssessmentResponse = CoverNoteResponse;
