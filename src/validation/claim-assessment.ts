import type { ClaimAssessmentPayload } from "../types/claim-assessment.js";
import { TiraValidationError } from "../errors.js";
import {
  validateRequired,
  validateHttpsUrl,
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

const RE_ASSESSMENT_OPTIONS: Record<string, string> = {
  Y: "Yes",
  N: "No",
};

export function validateClaimAssessmentPayload(
  payload: ClaimAssessmentPayload,
): void {
  // --- Header fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateHttpsUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");

  // --- Detail fields ---
  validateRequired(
    payload.claim_assessment_number,
    "claim_assessment_number",
  );
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

  const receivedDateStr =
    typeof payload.assessment_received_date === "string"
      ? payload.assessment_received_date
      : payload.assessment_received_date.toISOString();
  validateDateString(receivedDateStr, "assessment_received_date");

  validateRequired(
    payload.assessment_report_summary,
    "assessment_report_summary",
  );

  validateNumber(payload.assessment_amount, "assessment_amount");
  validateNumber(payload.approved_claim_amount, "approved_claim_amount");

  const approvalDateStr =
    typeof payload.claim_approval_date === "string"
      ? payload.claim_approval_date
      : payload.claim_approval_date.toISOString();
  validateDateString(approvalDateStr, "claim_approval_date");

  validateRequired(
    payload.claim_approval_authority,
    "claim_approval_authority",
  );

  validateEnum(
    payload.is_re_assessment,
    RE_ASSESSMENT_OPTIONS,
    "is_re_assessment",
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
