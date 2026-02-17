import type { CoverNoteResponse, SimpleClaimant } from "./common.js";

export interface DischargeVoucherPayload {
  /** Unique request identifier */
  request_id: string;
  /** Callback URL for responses (must be HTTPS) */
  callback_url: string;
  /** Insurer company code */
  insurer_company_code: string;
  /** Discharge voucher number. String(50) */
  discharge_voucher_number: string;
  /** Claim assessment number. String(50) */
  claim_assessment_number: string;
  /** Claim reference number. String(50) */
  claim_reference_number: string;
  /** Cover note reference number. String(50) */
  covernote_reference_number: string;
  /** Discharge voucher date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  discharge_voucher_date: string | Date;
  /** ISO 4217 currency code. Defaults to TZS. */
  currency_code?: string | undefined;
  /** Exchange rate. Defaults to 1.0. */
  exchange_rate?: number | undefined;
  /** Claim offer communication date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  claim_offer_communication_date: string | Date;
  /** Claim offer amount. Numeric(36,2) */
  claim_offer_amount: number;
  /** Claimant response date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  claimant_response_date: string | Date;
  /** Adjustment date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  adjustment_date: string | Date;
  /** Adjustment reason. String(1000) */
  adjustment_reason: string;
  /** Adjustment amount. Numeric(36,2) */
  adjustment_amount: number;
  /** Reconciliation date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  reconciliation_date: string | Date;
  /** Reconciliation summary. String(1000) */
  reconciliation_summary: string;
  /** Reconciled amount. Numeric(36,2) */
  reconciled_amount: number;
  /** Whether the offer was accepted: Y-Yes, N-No */
  offer_accepted: "Y" | "N";
  /** Claimant details. At least one claimant required. */
  claimants: SimpleClaimant[];
}

export type DischargeVoucherResponse = CoverNoteResponse;
