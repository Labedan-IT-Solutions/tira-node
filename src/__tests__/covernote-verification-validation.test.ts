import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validateCoverNoteVerificationPayload } from "../validation/covernote-verification.js";
import {
  validCoverNoteVerificationPayload,
  validCoverNoteVerificationPayloadFull,
} from "./fixtures.js";

describe("validateCoverNoteVerificationPayload", () => {
  it("valid minimal payload passes", () => {
    expect(() =>
      validateCoverNoteVerificationPayload(validCoverNoteVerificationPayload),
    ).not.toThrow();
  });

  it("valid full payload passes", () => {
    expect(() =>
      validateCoverNoteVerificationPayload(
        validCoverNoteVerificationPayloadFull,
      ),
    ).not.toThrow();
  });

  it("throws when request_id is missing", () => {
    expect(() =>
      validateCoverNoteVerificationPayload({
        ...validCoverNoteVerificationPayload,
        request_id: "",
      }),
    ).toThrow(TiraValidationError);
  });

  it("throws when covernote_reference_number is missing", () => {
    expect(() =>
      validateCoverNoteVerificationPayload({
        ...validCoverNoteVerificationPayload,
        covernote_reference_number: "",
      }),
    ).toThrow(TiraValidationError);
  });

  it("does not throw when optional fields are undefined", () => {
    expect(() =>
      validateCoverNoteVerificationPayload({
        request_id: "REQ-001",
        covernote_reference_number: "CN-001",
      }),
    ).not.toThrow();
  });
});
