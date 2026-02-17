import type { ClaimNotificationPayload } from "../types/claim-notification.js";
import {
  validateRequired,
  validateHttpsUrl,
  validateEnum,
  validateDateString,
} from "./validators.js";

export function validateClaimNotificationPayload(
  payload: ClaimNotificationPayload,
): void {
  // --- Header fields ---
  validateRequired(payload.request_id, "request_id");
  validateRequired(payload.callback_url, "callback_url");
  validateHttpsUrl(payload.callback_url, "callback_url");
  validateRequired(payload.insurer_company_code, "insurer_company_code");

  // --- Detail fields ---
  validateRequired(
    payload.claim_notification_number,
    "claim_notification_number",
  );
  validateRequired(
    payload.covernote_reference_number,
    "covernote_reference_number",
  );

  const reportDateStr =
    typeof payload.claim_report_date === "string"
      ? payload.claim_report_date
      : payload.claim_report_date.toISOString();
  validateDateString(reportDateStr, "claim_report_date");

  validateEnum(
    payload.claim_form_dully_filled,
    { Y: "Yes", N: "No" },
    "claim_form_dully_filled",
  );

  const lossDateStr =
    typeof payload.loss_date === "string"
      ? payload.loss_date
      : payload.loss_date.toISOString();
  validateDateString(lossDateStr, "loss_date");

  validateRequired(payload.loss_nature, "loss_nature");
  validateRequired(payload.loss_type, "loss_type");
  validateRequired(payload.loss_location, "loss_location");
  validateRequired(payload.officer_name, "officer_name");
  validateRequired(payload.officer_title, "officer_title");
}
