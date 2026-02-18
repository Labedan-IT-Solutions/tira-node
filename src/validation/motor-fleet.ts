import type { MotorFleetCoverNotePayload } from "../types/motor-fleet.js";
import {
  validateRequired,
  validateEnum,
  validatePositiveNumber,
  validateDateString,
  validateDateRange,
  validateUrl,
  validateNumber,
} from "./validators.js";
import {
  validateRisksCoveredArray,
  validateSubjectMattersArray,
  validateCoverNoteAddonsArray,
  validatePolicyHoldersArray,
} from "./covernote.js";
import { validateMotorDetails } from "./motor.js";
import { TiraValidationError } from "../errors.js";

export function validateMotorFleetCoverNotePayload(
  payload: MotorFleetCoverNotePayload,
): void {
  // --- Top-level fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");
  validateEnum(
    payload.covernote_type,
    {
      "1": "New",
      "2": "Renewal",
      "3": "Endorsement",
    },
    "covernote_type",
  );

  // --- Fleet-specific fields ---
  validateRequired(payload.fleet_id, "fleet_id");
  validateEnum(
    payload.fleet_type,
    {
      "1": "New Fleet",
      "2": "Additional vehicles to existing fleet",
    },
    "fleet_type",
  );
  validatePositiveNumber(payload.fleet_size, "fleet_size");

  validateRequired(payload.sales_point_code, "sales_point_code");

  // Dates
  const startStr =
    typeof payload.covernote_start_date === "string"
      ? payload.covernote_start_date
      : payload.covernote_start_date.toISOString();
  const endStr =
    typeof payload.covernote_end_date === "string"
      ? payload.covernote_end_date
      : payload.covernote_end_date.toISOString();

  validateDateString(startStr, "covernote_start_date");
  validateDateString(endStr, "covernote_end_date");
  validateDateRange(startStr, endStr);

  validateEnum(
    payload.payment_mode,
    {
      "1": "Cash",
      "2": "Cheque",
      "3": "EFT",
    },
    "payment_mode",
  );

  // Premiums
  validatePositiveNumber(
    payload.total_premium_excluding_tax,
    "total_premium_excluding_tax",
  );
  validatePositiveNumber(
    payload.total_premium_including_tax,
    "total_premium_including_tax",
  );

  if (
    payload.total_premium_including_tax < payload.total_premium_excluding_tax
  ) {
    throw new TiraValidationError(
      "total_premium_including_tax must be greater than or equal to total_premium_excluding_tax.",
      "total_premium_including_tax",
    );
  }

  validateRequired(payload.officer_name, "officer_name");
  validateRequired(payload.officer_title, "officer_title");
  validateRequired(payload.product_code, "product_code");

  // --- Policy Holders (fleet-level) ---
  validatePolicyHoldersArray(payload.policy_holders, "");

  // --- Fleet Details ---
  if (
    !Array.isArray(payload.fleet_details) ||
    payload.fleet_details.length === 0
  ) {
    throw new TiraValidationError(
      "At least one fleet detail entry must be provided.",
      "fleet_details",
    );
  }

  for (let f = 0; f < payload.fleet_details.length; f++) {
    const fd = payload.fleet_details[f]!;
    const prefix = `fleet_details[${f}]`;

    validateNumber(fd.fleet_entry, `${prefix}.fleet_entry`);
    validateRequired(fd.covernote_number, `${prefix}.covernote_number`);

    // Previous cover note required for renewal and endorsement
    if (payload.covernote_type !== "1") {
      validateRequired(
        fd.previous_covernote_reference_number,
        `${prefix}.previous_covernote_reference_number`,
      );
    }

    validateRequired(fd.covernote_desc, `${prefix}.covernote_desc`);
    validateRequired(fd.operative_clause, `${prefix}.operative_clause`);

    // Endorsement fields per vehicle
    if (payload.covernote_type === "3") {
      if (!fd.endorsement_type) {
        throw new TiraValidationError(
          "Endorsement type is required for endorsements.",
          `${prefix}.endorsement_type`,
        );
      }
      validateEnum(
        fd.endorsement_type,
        {
          "1": "Increasing Premium",
          "2": "Decreasing Premium",
          "3": "Cover Details Changed",
          "4": "Cancellation",
        },
        `${prefix}.endorsement_type`,
      );
      validateRequired(fd.endorsement_reason, `${prefix}.endorsement_reason`);
    }

    // Per-vehicle arrays
    validateRisksCoveredArray(fd.risks_covered, `${prefix}.`);
    validateSubjectMattersArray(fd.subject_matters_covered, `${prefix}.`);
    validateCoverNoteAddonsArray(fd.covernote_addons, `${prefix}.`);

    // Per-vehicle motor details
    validateMotorDetails(fd.motor_details, `${prefix}.motor_details`);
  }
}
