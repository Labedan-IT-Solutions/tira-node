import type { PolicyPayload } from "../types/policy.js";
import { validateRequired, validateHttpsUrl } from "./validators.js";
import { TiraValidationError } from "../errors.js";

export function validatePolicyPayload(payload: PolicyPayload): void {
  // --- Header fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateHttpsUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");

  // --- Policy Details ---
  if (
    !Array.isArray(payload.policy_details) ||
    payload.policy_details.length === 0
  ) {
    throw new TiraValidationError(
      "At least one policy detail entry must be provided.",
      "policy_details",
    );
  }

  for (let i = 0; i < payload.policy_details.length; i++) {
    const d = payload.policy_details[i]!;
    const prefix = `policy_details[${i}]`;

    validateRequired(d.policy_number, `${prefix}.policy_number`);
    validateRequired(
      d.policy_operative_clause,
      `${prefix}.policy_operative_clause`,
    );
    validateRequired(d.special_conditions, `${prefix}.special_conditions`);

    // applied_cover_notes must be non-empty array of non-empty strings
    if (
      !Array.isArray(d.applied_cover_notes) ||
      d.applied_cover_notes.length === 0
    ) {
      throw new TiraValidationError(
        `At least one cover note reference number must be provided in ${prefix}.applied_cover_notes.`,
        `${prefix}.applied_cover_notes`,
      );
    }

    for (let j = 0; j < d.applied_cover_notes.length; j++) {
      validateRequired(
        d.applied_cover_notes[j],
        `${prefix}.applied_cover_notes[${j}]`,
      );
    }
  }
}
