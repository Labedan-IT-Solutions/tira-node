import type { CoverNoteVerificationPayload } from "../types/covernote-verification.js";
import { validateRequired } from "./validators.js";

export function validateCoverNoteVerificationPayload(
  payload: CoverNoteVerificationPayload,
): void {
  validateRequired(payload.request_id, "request_id");
  validateRequired(
    payload.covernote_reference_number,
    "covernote_reference_number",
  );
}
