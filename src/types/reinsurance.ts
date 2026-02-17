import type { CoverNoteResponse } from "./common.js";

export interface ReinsuranceDetail {
  /** Participant code assigned by TIRA */
  participant_code: string;
  /** Participant type: 1-Leader, 2-Treaty Cession, 3-Policy Cession Outward, 4-Facultative Outward Local, 5-Facultative Outward Foreign, 6-Facultative Inward Local, 7-Facultative Inward Foreign */
  participant_type: "1" | "2" | "3" | "4" | "5" | "6" | "7";
  /** Reinsurance form: 1-Policy Cession, 2-Treaty Cession, 3-Facultative */
  reinsurance_form: "1" | "2" | "3";
  /** Reinsurance type: 1-Fac Proportion-Quota share, 2-Fac Non Proportion-Excess of Loss, 3-Fac Proportion-Surplus treaty, 4-Fac Obligatory, 5-Treaty Proportion-Quota Share, 6-Treaty Proportion-Surplus Treaty, 7-Treaty Non Proportion-Excess of Loss, 8-Treaty Non Proportion-Stop Loss */
  reinsurance_type: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
  /** Reinsurance broker code. Provided by TIRA. */
  re_broker_code: string;
  /** Brokerage commission amount (Max 2 decimal places) */
  brokerage_commission: number;
  /** Reinsurance commission amount (Max 2 decimal places) */
  reinsurance_commission: number;
  /** Premium share amount (Max 2 decimal places) */
  premium_share: number;
  /** Participation date in ISO format or Date object */
  participation_date: string | Date;
}

export interface ReinsurancePayload {
  /** Unique request identifier */
  request_id: string;
  /** Callback URL for async responses (must be HTTPS) */
  callback_url: string;
  /** Insurer company code */
  insurer_company_code: string;
  /** Cover note reference number from a previously submitted cover note */
  covernote_reference_number: string;
  /** Total premium including tax (Max 2 decimal places) */
  premium_including_tax: number;
  /** ISO Currency code. Defaults to TZS. */
  currency_code?: string | undefined;
  /** Exchange rate to TZS. Defaults to 1.0. */
  exchange_rate?: number | undefined;
  /** Name of the authorizing officer */
  authorizing_officer_name: string;
  /** Title of the authorizing officer */
  authorizing_officer_title: string;
  /** Reinsurance category: 1-Facultative outward, 2-Facultative inward */
  reinsurance_category: "1" | "2";
  /** Array of reinsurance participants. At least one required. */
  reinsurance_details: ReinsuranceDetail[];
}

/** Sync acknowledgement response from TIRA for reinsurance submission */
export type ReinsuranceResponse = CoverNoteResponse;
