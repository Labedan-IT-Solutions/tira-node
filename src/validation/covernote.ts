import type { CoverNotePayloadBase, RisksCovered, SubjectMatter, CoverNoteAddon, PolicyHolder } from "../types/common.js";
import {
  validateRequired,
  validateEnum,
  validatePositiveNumber,
  validateNumber,
  validateDateString,
  validateDateRange,
  validatePhoneNumber,
  validateEmail,
  validateUrl,
  validateTaxesCharged,
} from "./validators.js";
import { TiraValidationError } from "../errors.js";

export function validateRisksCoveredArray(
  risks: RisksCovered[],
  prefix: string,
): void {
  const fieldName = `${prefix}risks_covered`;

  if (!Array.isArray(risks) || risks.length === 0) {
    throw new TiraValidationError(
      "At least one risk must be provided.",
      fieldName,
    );
  }

  for (let i = 0; i < risks.length; i++) {
    const r = risks[i]!;
    const label = `${fieldName}[${i}]`;

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
        validateEnum(
          d.discount_type,
          { "1": "Fleet Discount" },
          `${dLabel}.discount_type`,
        );
        validateNumber(d.discount_rate, `${dLabel}.discount_rate`);
        validateNumber(d.discount_amount, `${dLabel}.discount_amount`);
      }
    }

    validateTaxesCharged(r.taxes_charged, label);
  }
}

export function validateSubjectMattersArray(
  subjects: SubjectMatter[],
  prefix: string,
): void {
  const fieldName = `${prefix}subject_matters_covered`;

  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new TiraValidationError(
      "At least one subject matter must be provided.",
      fieldName,
    );
  }

  for (let i = 0; i < subjects.length; i++) {
    const s = subjects[i]!;
    const label = `${fieldName}[${i}]`;
    validateRequired(
      s.subject_matter_reference,
      `${label}.subject_matter_reference`,
    );
    validateRequired(s.subject_matter_desc, `${label}.subject_matter_desc`);
  }
}

export function validateCoverNoteAddonsArray(
  addons: CoverNoteAddon[] | undefined,
  prefix: string,
): void {
  if (!addons) return;

  const fieldName = `${prefix}covernote_addons`;

  if (!Array.isArray(addons)) {
    throw new TiraValidationError(
      "covernote_addons must be an array.",
      fieldName,
    );
  }

  for (let i = 0; i < addons.length; i++) {
    const a = addons[i]!;
    const label = `${fieldName}[${i}]`;

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

export function validatePolicyHoldersArray(
  holders: PolicyHolder[],
  prefix: string,
): void {
  const fieldName = `${prefix}policy_holders`;

  if (!Array.isArray(holders) || holders.length === 0) {
    throw new TiraValidationError(
      "At least one policy holder must be provided.",
      fieldName,
    );
  }

  for (let i = 0; i < holders.length; i++) {
    const p = holders[i]!;
    const label = `${fieldName}[${i}]`;

    validateRequired(p.policyholder_name, `${label}.policyholder_name`);
    validateDateString(
      p.policyholder_birthdate,
      `${label}.policyholder_birthdate`,
    );
    validateEnum(
      p.policyholder_type,
      {
        "1": "Individual",
        "2": "Corporate",
      },
      `${label}.policyholder_type`,
    );
    validateEnum(
      p.policyholder_id_type,
      {
        "1": "NIDA",
        "2": "Voters ID Card",
        "3": "Passport",
        "4": "Driving License",
        "5": "Zanzibar ID",
        "6": "TIN",
        "7": "Company Incorporation Certificate Number",
      },
      `${label}.policyholder_id_type`,
    );
    validateRequired(
      p.policyholder_id_number,
      `${label}.policyholder_id_number`,
    );
    validateEnum(p.gender, { M: "Male", F: "Female" }, `${label}.gender`);
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
}

export function validateCoverNotePayload(
  payload: CoverNotePayloadBase,
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

  // Endorsement fields
  if (payload.covernote_type === "3") {
    if (!payload.endorsement_type) {
      throw new TiraValidationError(
        "Endorsement type is required for endorsements.",
        "endorsement_type",
      );
    }
    validateEnum(
      payload.endorsement_type,
      {
        "1": "Increasing Premium",
        "2": "Decreasing Premium",
        "3": "Cover Details Changed",
        "4": "Cancellation",
      },
      "endorsement_type",
    );
    validateRequired(payload.endorsement_reason, "endorsement_reason");
  }

  validateRisksCoveredArray(payload.risks_covered, "");
  validateSubjectMattersArray(payload.subject_matters_covered, "");
  validateCoverNoteAddonsArray(payload.covernote_addons, "");
  validatePolicyHoldersArray(payload.policy_holders, "");
}
