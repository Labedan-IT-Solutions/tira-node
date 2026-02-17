import type { NonLifeOtherCoverNotePayload } from "../types/non-life-other.js";
import { validateCoverNotePayload } from "./covernote.js";

export function validateNonLifeOtherCoverNotePayload(
  payload: NonLifeOtherCoverNotePayload,
): void {
  validateCoverNotePayload(payload);
}
