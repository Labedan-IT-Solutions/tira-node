import type { DischargeVoucherPayload } from "../types/discharge-voucher.js";
import { TiraValidationError } from "../errors.js";
import {
  validateRequired,
  validateUrl,
  validateDateString,
  validateEnum,
  validateNumber,
} from "./validators.js";

const ID_TYPES: Record<string, string> = {
  "1": "NIN",
  "2": "Voters registration number",
  "3": "Passport number",
  "4": "Driving License",
  "5": "Zanzibar Resident Id",
  "6": "TIN",
  "7": "Company Incorporation Certificate Number",
};

const CLAIMANT_CATEGORIES: Record<string, string> = {
  "1": "Policyholder",
  "2": "Third Party",
};

const CLAIMANT_TYPES: Record<string, string> = {
  "1": "Individual",
  "2": "Corporate",
};

const OFFER_ACCEPTED_OPTIONS: Record<string, string> = {
  Y: "Yes",
  N: "No",
};

function toDateStr(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

export function validateDischargeVoucherPayload(
  payload: DischargeVoucherPayload,
): void {
  // --- Header fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");

  // --- Detail string fields ---
  validateRequired(
    payload.discharge_voucher_number,
    "discharge_voucher_number",
  );
  validateRequired(
    payload.claim_assessment_number,
    "claim_assessment_number",
  );
  validateRequired(
    payload.claim_reference_number,
    "claim_reference_number",
  );
  validateRequired(
    payload.covernote_reference_number,
    "covernote_reference_number",
  );
  validateRequired(payload.adjustment_reason, "adjustment_reason");
  validateRequired(payload.reconciliation_summary, "reconciliation_summary");

  // --- Date fields ---
  validateDateString(
    toDateStr(payload.discharge_voucher_date),
    "discharge_voucher_date",
  );
  validateDateString(
    toDateStr(payload.claim_offer_communication_date),
    "claim_offer_communication_date",
  );
  validateDateString(
    toDateStr(payload.claimant_response_date),
    "claimant_response_date",
  );
  validateDateString(
    toDateStr(payload.adjustment_date),
    "adjustment_date",
  );
  validateDateString(
    toDateStr(payload.reconciliation_date),
    "reconciliation_date",
  );

  // --- Numeric fields ---
  validateNumber(payload.claim_offer_amount, "claim_offer_amount");
  validateNumber(payload.adjustment_amount, "adjustment_amount");
  validateNumber(payload.reconciled_amount, "reconciled_amount");

  // --- Enum fields ---
  validateEnum(
    payload.offer_accepted,
    OFFER_ACCEPTED_OPTIONS,
    "offer_accepted",
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
