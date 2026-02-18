import type { ReinsurancePayload } from "../types/reinsurance.js";
import {
  validateRequired,
  validateEnum,
  validatePositiveNumber,
  validateNumber,
  validateUrl,
  validateDateString,
} from "./validators.js";
import { TiraValidationError } from "../errors.js";

export function validateReinsurancePayload(payload: ReinsurancePayload): void {
  // --- Header fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");
  validateRequired(
    payload.covernote_reference_number,
    "covernote_reference_number",
  );
  validatePositiveNumber(
    payload.premium_including_tax,
    "premium_including_tax",
  );
  validateRequired(
    payload.authorizing_officer_name,
    "authorizing_officer_name",
  );
  validateRequired(
    payload.authorizing_officer_title,
    "authorizing_officer_title",
  );
  validateEnum(
    payload.reinsurance_category,
    {
      "1": "Facultative outward",
      "2": "Facultative inward",
    },
    "reinsurance_category",
  );

  // --- Reinsurance Details ---
  if (
    !Array.isArray(payload.reinsurance_details) ||
    payload.reinsurance_details.length === 0
  ) {
    throw new TiraValidationError(
      "At least one reinsurance detail entry must be provided.",
      "reinsurance_details",
    );
  }

  for (let i = 0; i < payload.reinsurance_details.length; i++) {
    const d = payload.reinsurance_details[i]!;
    const prefix = `reinsurance_details[${i}]`;

    validateRequired(d.participant_code, `${prefix}.participant_code`);
    validateRequired(d.re_broker_code, `${prefix}.re_broker_code`);
    validateEnum(
      d.participant_type,
      {
        "1": "Leader",
        "2": "Treaty Cession",
        "3": "Policy Cession Outward",
        "4": "Facultative Outward Local",
        "5": "Facultative Outward Foreign",
        "6": "Facultative Inward Local",
        "7": "Facultative Inward Foreign",
      },
      `${prefix}.participant_type`,
    );
    validateEnum(
      d.reinsurance_form,
      {
        "1": "Policy Cession",
        "2": "Treaty Cession",
        "3": "Facultative",
      },
      `${prefix}.reinsurance_form`,
    );
    validateEnum(
      d.reinsurance_type,
      {
        "1": "Fac Proportion-Quota share",
        "2": "Fac Non Proportion-Excess of Loss",
        "3": "Fac Proportion-Surplus treaty",
        "4": "Fac Obligatory",
        "5": "Treaty Proportion-Quota Share",
        "6": "Treaty Proportion-Surplus Treaty",
        "7": "Treaty Non Proportion-Excess of Loss",
        "8": "Treaty Non Proportion-Stop Loss",
      },
      `${prefix}.reinsurance_type`,
    );
    validateNumber(d.brokerage_commission, `${prefix}.brokerage_commission`);
    validateNumber(
      d.reinsurance_commission,
      `${prefix}.reinsurance_commission`,
    );
    validateNumber(d.premium_share, `${prefix}.premium_share`);

    const dateStr =
      typeof d.participation_date === "string"
        ? d.participation_date
        : d.participation_date.toISOString();
    validateDateString(dateStr, `${prefix}.participation_date`);
  }
}
