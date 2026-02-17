import type { MotorCoverNotePayload } from "../types/motor.js";
import {
  validateRequired,
  validateEnum,
  validatePositiveNumber,
  validateNumber,
  validateDateString,
  validateDateRange,
  validatePhoneNumber,
  validateEmail,
  validateHttpsUrl,
  validateTaxesCharged,
} from "./validators.js";
import { TiraValidationError } from "../errors.js";

export function validateMotorCoverNotePayload(
  payload: MotorCoverNotePayload,
): void {
  // --- Top-level fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateHttpsUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");
  validateEnum(payload.covernote_type, {
    '1': 'New',
    '2': 'Renewal',
    '3': 'Endorsement',
  }, "covernote_type");

  // Cover note number required for new and renewal (not endorsement)
  if (payload.covernote_type !== "3") {
    validateRequired(payload.covernote_number, "covernote_number");
  }

  // Previous cover note required for renewal and endorsement
  if (payload.covernote_type !== "1") {
    validateRequired(
      payload.previous_covernote_reference_number,
      "previous_covernote_reference_number",
    );
  }

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

  validateRequired(payload.covernote_desc, "covernote_desc");
  validateRequired(payload.operative_clause, "operative_clause");
  validateEnum(payload.payment_mode, {
    '1': 'Cash',
    '2': 'Cheque',
    '3': 'EFT',
  }, "payment_mode");

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

  // Endorsement fields
  if (payload.covernote_type === "3") {
    if (!payload.endorsement_type) {
      throw new TiraValidationError(
        "Endorsement type is required for endorsements.",
        "endorsement_type",
      );
    }
    validateEnum(payload.endorsement_type, {
      '1': 'Increasing Premium',
      '2': 'Decreasing Premium',
      '3': 'Cover Details Changed',
      '4': 'Cancellation',
    }, "endorsement_type");
    validateRequired(payload.endorsement_reason, "endorsement_reason");
  }

  // --- Risks Covered ---
  if (
    !Array.isArray(payload.risks_covered) ||
    payload.risks_covered.length === 0
  ) {
    throw new TiraValidationError(
      "At least one risk must be provided.",
      "risks_covered",
    );
  }

  for (let i = 0; i < payload.risks_covered.length; i++) {
    const r = payload.risks_covered[i]!;
    const label = `risks_covered[${i}]`;

    validateRequired(r.risk_code, `${label}.risk_code`);
    validateNumber(r.sum_insured, `${label}.sum_insured`);
    validateNumber(r.sum_insured_equivalent, `${label}.sum_insured_equivalent`);
    validateNumber(r.premium_rate, `${label}.premium_rate`);
    validateNumber(
      r.premium_before_discount,
      `${label}.premium_before_discount`,
    );
    validateNumber(r.premium_after_discount, `${label}.premium_after_discount`);
    validateNumber(
      r.premium_excluding_tax_equivalent,
      `${label}.premium_excluding_tax_equivalent`,
    );
    validateNumber(r.premium_including_tax, `${label}.premium_including_tax`);

    // Discounts - optional but validate if present
    if (r.discounts_offered) {
      if (!Array.isArray(r.discounts_offered)) {
        throw new TiraValidationError(
          "discounts_offered must be an array.",
          `${label}.discounts_offered`,
        );
      }
      for (let j = 0; j < r.discounts_offered.length; j++) {
        const d = r.discounts_offered[j]!;
        const dLabel = `${label}.discounts_offered[${j}]`;
        validateEnum(d.discount_type, { '1': 'Fleet Discount' }, `${dLabel}.discount_type`);
        validateNumber(d.discount_rate, `${dLabel}.discount_rate`);
        validateNumber(d.discount_amount, `${dLabel}.discount_amount`);
      }
    }

    validateTaxesCharged(r.taxes_charged, label);
  }

  // --- Subject Matters ---
  if (
    !Array.isArray(payload.subject_matters_covered) ||
    payload.subject_matters_covered.length === 0
  ) {
    throw new TiraValidationError(
      "At least one subject matter must be provided.",
      "subject_matters_covered",
    );
  }

  for (let i = 0; i < payload.subject_matters_covered.length; i++) {
    const s = payload.subject_matters_covered[i]!;
    const label = `subject_matters_covered[${i}]`;
    validateRequired(
      s.subject_matter_reference,
      `${label}.subject_matter_reference`,
    );
    validateRequired(s.subject_matter_desc, `${label}.subject_matter_desc`);
  }

  // --- Cover Note Addons (optional) ---
  if (payload.covernote_addons) {
    if (!Array.isArray(payload.covernote_addons)) {
      throw new TiraValidationError(
        "covernote_addons must be an array.",
        "covernote_addons",
      );
    }

    for (let i = 0; i < payload.covernote_addons.length; i++) {
      const a = payload.covernote_addons[i]!;
      const label = `covernote_addons[${i}]`;

      validateRequired(a.addon_reference, `${label}.addon_reference`);
      validateRequired(a.addon_description, `${label}.addon_description`);
      validateNumber(a.addon_amount, `${label}.addon_amount`);
      validateNumber(a.addon_premium_rate, `${label}.addon_premium_rate`);
      validateNumber(a.premium_excluding_tax, `${label}.premium_excluding_tax`);
      validateNumber(
        a.premium_excluding_tax_equivalent,
        `${label}.premium_excluding_tax_equivalent`,
      );
      validateNumber(a.premium_including_tax, `${label}.premium_including_tax`);
      validateTaxesCharged(a.taxes_charged, label);
    }
  }

  // --- Policy Holders ---
  if (
    !Array.isArray(payload.policy_holders) ||
    payload.policy_holders.length === 0
  ) {
    throw new TiraValidationError(
      "At least one policy holder must be provided.",
      "policy_holders",
    );
  }

  for (let i = 0; i < payload.policy_holders.length; i++) {
    const p = payload.policy_holders[i]!;
    const label = `policy_holders[${i}]`;

    validateRequired(p.policyholder_name, `${label}.policyholder_name`);
    validateDateString(
      p.policyholder_birthdate,
      `${label}.policyholder_birthdate`,
    );
    validateEnum(p.policyholder_type, {
      '1': 'Individual',
      '2': 'Corporate',
    }, `${label}.policyholder_type`);
    validateEnum(p.policyholder_id_type, {
      '1': 'NIDA',
      '2': 'Voters ID Card',
      '3': 'Passport',
      '4': 'Driving License',
      '5': 'Zanzibar ID',
      '6': 'TIN',
      '7': 'Company Incorporation Certificate Number',
    }, `${label}.policyholder_id_type`);
    validateRequired(
      p.policyholder_id_number,
      `${label}.policyholder_id_number`,
    );
    validateEnum(p.gender, { 'M': 'Male', 'F': 'Female' }, `${label}.gender`);
    validateRequired(p.region, `${label}.region`);
    validateRequired(p.district, `${label}.district`);
    validateRequired(p.street, `${label}.street`);
    validateRequired(p.phone_number, `${label}.phone_number`);
    validatePhoneNumber(p.phone_number, `${label}.phone_number`);
    validateRequired(p.postal_address, `${label}.postal_address`);

    if (p.email_address) {
      validateEmail(p.email_address, `${label}.email_address`);
    }
  }

  // --- Motor Details ---
  const m = payload.motor_details;

  validateEnum(m.motor_category, {
    '1': 'Motor Vehicle',
    '2': 'Motor Cycle',
  }, "motor_details.motor_category");
  validateEnum(m.motor_type, {
    '1': 'Registered',
    '2': 'In Transit',
  }, "motor_details.motor_type");

  if (m.motor_type === "1") {
    validateRequired(
      m.registration_number,
      "motor_details.registration_number",
    );
  }

  validateRequired(m.chassis_number, "motor_details.chassis_number");
  validateRequired(m.make, "motor_details.make");
  validateRequired(m.model, "motor_details.model");
  validateRequired(m.model_number, "motor_details.model_number");
  validateRequired(m.body_type, "motor_details.body_type");
  validateRequired(m.color, "motor_details.color");
  validateRequired(m.engine_number, "motor_details.engine_number");
  validateRequired(m.engine_capacity, "motor_details.engine_capacity");
  validateRequired(m.fuel_used, "motor_details.fuel_used");

  // Axles, axle distance, sitting capacity required for motor vehicles (not motor cycles)
  if (m.motor_category === "1") {
    validateNumber(
      m.number_of_axles as number,
      "motor_details.number_of_axles",
    );
    validateNumber(m.axle_distance as number, "motor_details.axle_distance");
    validateNumber(
      m.sitting_capacity as number,
      "motor_details.sitting_capacity",
    );
  }

  if (
    isNaN(m.year_of_manufacture) ||
    m.year_of_manufacture < 1900 ||
    m.year_of_manufacture > new Date().getFullYear() + 1
  ) {
    throw new TiraValidationError(
      "A valid year of manufacture is required.",
      "motor_details.year_of_manufacture",
    );
  }

  validatePositiveNumber(m.tare_weight, "motor_details.tare_weight");
  validatePositiveNumber(m.gross_weight, "motor_details.gross_weight");
  validateEnum(m.motor_usage, {
    '1': 'Private',
    '2': 'Commercial',
  }, "motor_details.motor_usage");
  validateRequired(m.owner_name, "motor_details.owner_name");
  validateEnum(m.owner_category, {
    '1': 'Sole Proprietor',
    '2': 'Corporate',
  }, "motor_details.owner_category");
  validateRequired(m.owner_address, "motor_details.owner_address");
}
