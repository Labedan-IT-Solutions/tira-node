import type { ClaimPaymentPayload } from "../types/claim-payment.js";
import { TiraValidationError } from "../errors.js";
import {
  validateRequired,
  validateHttpsUrl,
  validateDateString,
  validateEnum,
  validateNumber,
} from "./validators.js";

const PAYMENT_MODES: Record<string, string> = {
  "1": "Cash",
  "2": "Cheque",
  "3": "EFT",
};

const YES_NO: Record<string, string> = {
  Y: "Yes",
  N: "No",
};

const CLAIMANT_CATEGORIES: Record<string, string> = {
  "1": "Policyholder",
  "2": "Third Party",
};

const CLAIMANT_TYPES: Record<string, string> = {
  "1": "Individual",
  "2": "Corporate",
};

const ID_TYPES: Record<string, string> = {
  "1": "NIN",
  "2": "Voters registration number",
  "3": "Passport number",
  "4": "Driving License",
  "5": "Zanzibar Resident Id",
  "6": "TIN",
  "7": "Company Incorporation Certificate Number",
};

function toDateStr(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

export function validateClaimPaymentPayload(
  payload: ClaimPaymentPayload,
): void {
  // --- Header fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateHttpsUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");

  // --- Detail string fields ---
  validateRequired(payload.claim_payment_number, "claim_payment_number");
  validateRequired(payload.claim_reference_number, "claim_reference_number");
  validateRequired(payload.claim_intimation_number, "claim_intimation_number");
  validateRequired(
    payload.covernote_reference_number,
    "covernote_reference_number",
  );
  validateRequired(payload.litigation_reason, "litigation_reason");

  // --- Date fields ---
  validateDateString(toDateStr(payload.payment_date), "payment_date");

  // --- Numeric fields ---
  validateNumber(payload.paid_amount, "paid_amount");
  validateNumber(payload.net_premium_earned, "net_premium_earned");

  // --- Enum fields ---
  validateEnum(payload.payment_mode, PAYMENT_MODES, "payment_mode");
  validateEnum(payload.parties_notified, YES_NO, "parties_notified");
  validateEnum(
    payload.claim_resulted_litigation,
    YES_NO,
    "claim_resulted_litigation",
  );

  // --- Claimants ---
  if (!Array.isArray(payload.claimants) || payload.claimants.length === 0) {
    throw new TiraValidationError(
      "At least one claimant is required.",
      "claimants",
    );
  }

  for (let i = 0; i < payload.claimants.length; i++) {
    const c = payload.claimants[i]!;
    const label = `claimants[${i}]`;

    validateEnum(
      c.claimant_category,
      CLAIMANT_CATEGORIES,
      `${label}.claimant_category`,
    );
    validateEnum(c.claimant_type, CLAIMANT_TYPES, `${label}.claimant_type`);
    validateRequired(c.claimant_id_number, `${label}.claimant_id_number`);
    validateEnum(c.claimant_id_type, ID_TYPES, `${label}.claimant_id_type`);
  }
}
