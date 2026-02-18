import type { CoverNoteResponse } from "./common.js";

export interface Claimant {
  /** Claimant name. String(100) */
  claimant_name: string;
  /** Claimant birth date in YYYY-MM-DD format */
  claimant_birth_date: string;
  /** Claimant category: 1-Policyholder, 2-Third Party */
  claimant_category: "1" | "2";
  /** Claimant type: 1-Individual, 2-Corporate */
  claimant_type: "1" | "2";
  /** Claimant identification number. String(50) */
  claimant_id_number: string;
  /** Claimant identification type: 1-NIN, 2-Voters, 3-Passport, 4-Driving License, 5-ZANID, 6-TIN, 7-Company Incorporation */
  claimant_id_type: "1" | "2" | "3" | "4" | "5" | "6" | "7";
  /** Claimant gender: M-Male, F-Female */
  gender?: "M" | "F" | undefined;
  /** ISO 3166 alpha-3 country code. Defaults to TZA if not provided. */
  country_code?: string | undefined;
  /** Claimant region */
  region: string;
  /** Claimant district. String(100) */
  district: string;
  /** Claimant street. String(100) */
  street?: string | undefined;
  /** Claimant phone number. String(50) */
  claimant_phone_number: string;
  /** Claimant fax number. String(50) */
  claimant_fax?: string | undefined;
  /** Claimant postal address. String(50) */
  postal_address?: string | undefined;
  /** Claimant email address. String(50) */
  email_address?: string | undefined;
}

export interface ClaimIntimationPayload {
  /** Unique request identifier */
  request_id: string;
  /** Callback URL for responses */
  callback_url: string;
  /** Insurer company code */
  insurer_company_code: string;
  /** Claim intimation number. String(50) */
  claim_intimation_number: string;
  /** Claim reference number. String(50) */
  claim_reference_number: string;
  /** Cover note reference number. String(50) */
  covernote_reference_number: string;
  /** Claim intimation date and time. YYYY-MM-DD'T'HH:MM:SS format or Date object */
  claim_intimation_date: string | Date;
  /** ISO 4217 currency code. Defaults to TZS. */
  currency_code?: string | undefined;
  /** Exchange rate. Defaults to 1.0. */
  exchange_rate?: number | undefined;
  /** Claim estimated amount. Numeric(36,2) */
  claim_estimated_amount: number;
  /** Claim reserve amount. Numeric(36,2) */
  claim_reserve_amount: number;
  /** Claim reserve method. String(100) */
  claim_reserve_method: string;
  /** Loss assessment option: 1-In-house (Insurer employee), 2-External (Registered insurance adjuster) */
  loss_assessment_option: "1" | "2";
  /** Name of assessor. String(100) */
  assessor_name: string;
  /** Assessor identification number. String(50) */
  assessor_id_number: string;
  /** Assessor identification type: 1-NIN, 2-Voters, 3-Passport, 4-Driving License, 5-ZANID, 6-TIN, 7-Company Incorporation */
  assessor_id_type: "1" | "2" | "3" | "4" | "5" | "6" | "7";
  /** Claimant details. At least one claimant required. */
  claimants: Claimant[];
}

export type ClaimIntimationResponse = CoverNoteResponse;
