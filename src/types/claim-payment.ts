import type { CoverNoteResponse, SimpleClaimant } from "./common.js";

export interface ClaimPaymentPayload {
  /** Unique request identifier */
  request_id: string;
  /** Callback URL for responses */
  callback_url: string;
  /** Insurer company code */
  insurer_company_code: string;
  /** Claim payment number. String(50) */
  claim_payment_number: string;
  /** Claim reference number. String(50) */
  claim_reference_number: string;
  /** Claim intimation number. String(50) */
  claim_intimation_number: string;
  /** Cover note reference number. String(50) */
  covernote_reference_number: string;
  /** Payment date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  payment_date: string | Date;
  /** Paid amount. Numeric(36,2) */
  paid_amount: number;
  /** Payment mode: 1-Cash, 2-Cheque, 3-EFT */
  payment_mode: "1" | "2" | "3";
  /** Whether parties were notified: Y-Yes, N-No */
  parties_notified: "Y" | "N";
  /** Net premium earned. Numeric(36,2) */
  net_premium_earned: number;
  /** Whether claim resulted in litigation: Y-Yes, N-No */
  claim_resulted_litigation: "Y" | "N";
  /** Litigation reason. String(1000) */
  litigation_reason: string;
  /** ISO 4217 currency code. Defaults to TZS. */
  currency_code?: string | undefined;
  /** Exchange rate. Defaults to 1.0. */
  exchange_rate?: number | undefined;
  /** Claimant details. At least one claimant required. */
  claimants: SimpleClaimant[];
}

export type ClaimPaymentResponse = CoverNoteResponse;
