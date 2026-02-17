import type { PolicyPayload } from "../types/policy.js";
import { validateRequired, validateHttpsUrl } from "./validators.js";
import { TiraValidationError } from "../errors.js";

export function validatePolicyPayload(payload: PolicyPayload): void {
  // --- Header fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateHttpsUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");

  // --- Policy Detail ---
  if (!payload.policy_detail) {
    throw new TiraValidationError(
      "policy_detail is required.",
      "policy_detail",
    );
  }

  const d = payload.policy_detail;
  validateRequired(d.policy_number, "policy_detail.policy_number");
  validateRequired(
    d.policy_operative_clause,
    "policy_detail.policy_operative_clause",
  );
  validateRequired(d.special_conditions, "policy_detail.special_conditions");

  // applied_cover_notes must be non-empty array of non-empty strings
  if (
    !Array.isArray(d.applied_cover_notes) ||
    d.applied_cover_notes.length === 0
  ) {
    throw new TiraValidationError(
      "At least one cover note reference number must be provided in policy_detail.applied_cover_notes.",
      "policy_detail.applied_cover_notes",
    );
  }

  for (let j = 0; j < d.applied_cover_notes.length; j++) {
    validateRequired(
      d.applied_cover_notes[j],
      `policy_detail.applied_cover_notes[${j}]`,
    );
  }
}
