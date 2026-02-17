import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import {
  validateMotorCoverNotePayload,
  validateMotorVerificationPayload,
} from "../validation/motor.js";
import { validCoverNotePayload, validVerificationPayload } from "./fixtures.js";
import type { MotorCoverNotePayload } from "../types/motor.js";

function coverNote(overrides: Partial<MotorCoverNotePayload> = {}): MotorCoverNotePayload {
  return { ...validCoverNotePayload, ...overrides };
}

describe("validateMotorCoverNotePayload", () => {
  it("valid complete payload passes", () => {
    expect(() => validateMotorCoverNotePayload(validCoverNotePayload)).not.toThrow();
  });

  // --- Callback URL ---
  it("throws when callback_url uses HTTP", () => {
    expect(() =>
      validateMotorCoverNotePayload(coverNote({ callback_url: "http://example.com/cb" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url is missing", () => {
    expect(() =>
      validateMotorCoverNotePayload(coverNote({ callback_url: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Conditional required fields based on covernote_type ---
  it("throws when type '2' (renewal) without previous_covernote_reference_number", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({ covernote_type: "2", previous_covernote_reference_number: undefined }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when type '3' (endorsement) without previous_covernote_reference_number", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          covernote_type: "3",
          endorsement_type: "1",
          endorsement_reason: "change",
          previous_covernote_reference_number: undefined,
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when type '3' (endorsement) without endorsement_type", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          covernote_type: "3",
          previous_covernote_reference_number: "CN-REF-001",
          endorsement_reason: "change",
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when type '3' without endorsement_reason", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          covernote_type: "3",
          previous_covernote_reference_number: "CN-REF-001",
          endorsement_type: "1",
          endorsement_reason: undefined,
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("type '1' does NOT require previous_covernote_reference_number", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({ covernote_type: "1", previous_covernote_reference_number: undefined }),
      ),
    ).not.toThrow();
  });

  it("type '1' requires covernote_number", () => {
    expect(() =>
      validateMotorCoverNotePayload(coverNote({ covernote_type: "1", covernote_number: undefined })),
    ).toThrow(TiraValidationError);
  });

  it("type '2' requires covernote_number", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          covernote_type: "2",
          covernote_number: undefined,
          previous_covernote_reference_number: "CN-REF-001",
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("type '3' does NOT require covernote_number", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          covernote_type: "3",
          covernote_number: undefined,
          previous_covernote_reference_number: "CN-REF-001",
          endorsement_type: "1",
          endorsement_reason: "change",
        }),
      ),
    ).not.toThrow();
  });

  // --- Premiums ---
  it("throws when total_premium_including_tax < total_premium_excluding_tax", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({ total_premium_excluding_tax: 1000, total_premium_including_tax: 500 }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when premium is 0", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({ total_premium_excluding_tax: 0 }),
      ),
    ).toThrow(TiraValidationError);
  });

  // --- Dates ---
  it("throws when end date is before start date", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({ covernote_start_date: "2026-01-01", covernote_end_date: "2025-01-01" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date objects", () => {
    const now = new Date();
    const future = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({ covernote_start_date: now, covernote_end_date: future }),
      ),
    ).not.toThrow();
  });

  // --- Array validations ---
  it("throws when risks_covered is empty", () => {
    expect(() =>
      validateMotorCoverNotePayload(coverNote({ risks_covered: [] })),
    ).toThrow(TiraValidationError);
  });

  it("throws when subject_matters_covered is empty", () => {
    expect(() =>
      validateMotorCoverNotePayload(coverNote({ subject_matters_covered: [] })),
    ).toThrow(TiraValidationError);
  });

  it("throws when policy_holders is empty", () => {
    expect(() =>
      validateMotorCoverNotePayload(coverNote({ policy_holders: [] })),
    ).toThrow(TiraValidationError);
  });

  // --- Motor details conditional ---
  it("throws when motor_type '1' (registered) but registration_number missing", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          motor_details: {
            ...validCoverNotePayload.motor_details,
            motor_type: "1",
            registration_number: undefined,
          },
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("does NOT require registration_number when motor_type is '2' (in transit)", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          motor_details: {
            ...validCoverNotePayload.motor_details,
            motor_type: "2",
            registration_number: undefined,
          },
        }),
      ),
    ).not.toThrow();
  });

  it("requires number_of_axles for motor_category '1' (vehicle)", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          motor_details: {
            ...validCoverNotePayload.motor_details,
            motor_category: "1",
            number_of_axles: undefined,
          },
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("does NOT require number_of_axles for motor_category '2' (motorcycle)", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          motor_details: {
            ...validCoverNotePayload.motor_details,
            motor_category: "2",
            number_of_axles: undefined,
            axle_distance: undefined,
            sitting_capacity: undefined,
          },
        }),
      ),
    ).not.toThrow();
  });

  // --- Phone number ---
  it("throws on invalid phone number format", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          policy_holders: [
            { ...validCoverNotePayload.policy_holders[0]!, phone_number: "0712345678" },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  // --- Optional email ---
  it("validates email when present", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          policy_holders: [
            { ...validCoverNotePayload.policy_holders[0]!, email_address: "bad-email" },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("does not throw when email is absent", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          policy_holders: [
            { ...validCoverNotePayload.policy_holders[0]!, email_address: undefined },
          ],
        }),
      ),
    ).not.toThrow();
  });

  // --- Year of manufacture ---
  it("throws on year_of_manufacture below 1900", () => {
    expect(() =>
      validateMotorCoverNotePayload(
        coverNote({
          motor_details: { ...validCoverNotePayload.motor_details, year_of_manufacture: 1800 },
        }),
      ),
    ).toThrow(TiraValidationError);
  });
});

describe("validateMotorVerificationPayload", () => {
  it("valid payload with registration_number only", () => {
    expect(() => validateMotorVerificationPayload(validVerificationPayload)).not.toThrow();
  });

  it("valid payload with chassis_number only", () => {
    expect(() =>
      validateMotorVerificationPayload({
        request_id: "REQ-001",
        motor_category: "1",
        motor_chassis_number: "ABC123456789",
      }),
    ).not.toThrow();
  });

  it("throws when both registration_number AND chassis_number provided", () => {
    expect(() =>
      validateMotorVerificationPayload({
        request_id: "REQ-001",
        motor_category: "1",
        motor_registration_number: "T337DSE",
        motor_chassis_number: "ABC123456789",
      }),
    ).toThrow(TiraValidationError);
  });

  it("throws when neither identifier provided", () => {
    expect(() =>
      validateMotorVerificationPayload({
        request_id: "REQ-001",
        motor_category: "1",
      }),
    ).toThrow(TiraValidationError);
  });

  it("throws when request_id is missing", () => {
    expect(() =>
      validateMotorVerificationPayload({
        request_id: "",
        motor_category: "1",
        motor_registration_number: "T337DSE",
      }),
    ).toThrow(TiraValidationError);
  });

  it("throws when motor_category is invalid", () => {
    expect(() =>
      validateMotorVerificationPayload({
        request_id: "REQ-001",
        motor_category: "3" as any,
        motor_registration_number: "T337DSE",
      }),
    ).toThrow(TiraValidationError);
  });
});
