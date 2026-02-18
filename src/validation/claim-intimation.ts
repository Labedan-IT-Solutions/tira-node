import type { ClaimIntimationPayload } from "../types/claim-intimation.js";
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

const LOSS_ASSESSMENT_OPTIONS: Record<string, string> = {
  "1": "In-house",
  "2": "External",
};

const CLAIMANT_CATEGORIES: Record<string, string> = {
  "1": "Policyholder",
  "2": "Third Party",
};

const CLAIMANT_TYPES: Record<string, string> = {
  "1": "Individual",
  "2": "Corporate",
};

export function validateClaimIntimationPayload(
  payload: ClaimIntimationPayload,
): void {
  // --- Header fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");

  // --- Detail fields ---
  validateRequired(
    payload.claim_intimation_number,
    "claim_intimation_number",
  );
  validateRequired(
    payload.claim_reference_number,
    "claim_reference_number",
  );
  validateRequired(
    payload.covernote_reference_number,
    "covernote_reference_number",
  );

  const intimationDateStr =
    typeof payload.claim_intimation_date === "string"
      ? payload.claim_intimation_date
      : payload.claim_intimation_date.toISOString();
  validateDateString(intimationDateStr, "claim_intimation_date");

  validateNumber(payload.claim_estimated_amount, "claim_estimated_amount");
  validateNumber(payload.claim_reserve_amount, "claim_reserve_amount");
  validateRequired(payload.claim_reserve_method, "claim_reserve_method");

  validateEnum(
    payload.loss_assessment_option,
    LOSS_ASSESSMENT_OPTIONS,
    "loss_assessment_option",
  );

  validateRequired(payload.assessor_name, "assessor_name");
  validateRequired(payload.assessor_id_number, "assessor_id_number");
  validateEnum(payload.assessor_id_type, ID_TYPES, "assessor_id_type");

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

    validateRequired(c.claimant_name, `${label}.claimant_name`);
    validateRequired(c.claimant_birth_date, `${label}.claimant_birth_date`);
    validateEnum(
      c.claimant_category,
      CLAIMANT_CATEGORIES,
      `${label}.claimant_category`,
    );
    validateEnum(c.claimant_type, CLAIMANT_TYPES, `${label}.claimant_type`);
    validateRequired(c.claimant_id_number, `${label}.claimant_id_number`);
    validateEnum(c.claimant_id_type, ID_TYPES, `${label}.claimant_id_type`);
    validateRequired(c.region, `${label}.region`);
    validateRequired(c.district, `${label}.district`);
    validateRequired(
      c.claimant_phone_number,
      `${label}.claimant_phone_number`,
    );
  }
}
