import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validateMotorFleetCoverNotePayload } from "../validation/motor-fleet.js";
import { validFleetPayload, validFleetDetailEntry } from "./fixtures.js";
import type { MotorFleetCoverNotePayload } from "../types/motor-fleet.js";

function fleet(overrides: Partial<MotorFleetCoverNotePayload> = {}): MotorFleetCoverNotePayload {
  return { ...validFleetPayload, ...overrides };
}

describe("validateMotorFleetCoverNotePayload", () => {
  it("valid complete payload passes", () => {
    expect(() => validateMotorFleetCoverNotePayload(validFleetPayload)).not.toThrow();
  });

  // --- Top-level required fields ---
  it("throws when request_id is missing", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ request_id: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url uses HTTP", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ callback_url: "http://example.com/cb" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when insurer_company_code is missing", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ insurer_company_code: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when covernote_type is invalid", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ covernote_type: "9" as any })),
    ).toThrow(TiraValidationError);
  });

  // --- Fleet-specific fields ---
  it("throws when fleet_id is missing", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ fleet_id: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when fleet_type is invalid", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ fleet_type: "3" as any })),
    ).toThrow(TiraValidationError);
  });

  it("throws when fleet_size is 0", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ fleet_size: 0 })),
    ).toThrow(TiraValidationError);
  });

  it("throws when fleet_size is negative", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ fleet_size: -1 })),
    ).toThrow(TiraValidationError);
  });

  // --- Dates ---
  it("throws when end date is before start date", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({ covernote_start_date: "2026-01-01", covernote_end_date: "2025-01-01" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date objects", () => {
    const now = new Date();
    const future = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({ covernote_start_date: now, covernote_end_date: future }),
      ),
    ).not.toThrow();
  });

  // --- Premiums ---
  it("throws when total_premium_including_tax < total_premium_excluding_tax", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({ total_premium_excluding_tax: 1000, total_premium_including_tax: 500 }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when premium is 0", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ total_premium_excluding_tax: 0 })),
    ).toThrow(TiraValidationError);
  });

  // --- Policy Holders ---
  it("throws when policy_holders is empty", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ policy_holders: [] })),
    ).toThrow(TiraValidationError);
  });

  it("throws on invalid phone number", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          policy_holders: [
            { ...validFleetPayload.policy_holders[0]!, phone_number: "0712345678" },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  // --- Fleet Details ---
  it("throws when fleet_details is empty", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(fleet({ fleet_details: [] })),
    ).toThrow(TiraValidationError);
  });

  it("throws when fleet detail covernote_number is missing", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          fleet_details: [{ ...validFleetDetailEntry, covernote_number: "" }],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when fleet detail covernote_desc is missing", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          fleet_details: [{ ...validFleetDetailEntry, covernote_desc: "" }],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when fleet detail operative_clause is missing", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          fleet_details: [{ ...validFleetDetailEntry, operative_clause: "" }],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  // --- Per-vehicle risks ---
  it("throws when per-vehicle risks_covered is empty", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          fleet_details: [{ ...validFleetDetailEntry, risks_covered: [] }],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  // --- Per-vehicle subject matters ---
  it("throws when per-vehicle subject_matters_covered is empty", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          fleet_details: [{ ...validFleetDetailEntry, subject_matters_covered: [] }],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  // --- Per-vehicle motor details ---
  it("throws when motor_type '1' but registration_number missing", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          fleet_details: [
            {
              ...validFleetDetailEntry,
              motor_details: {
                ...validFleetDetailEntry.motor_details,
                motor_type: "1",
                registration_number: undefined,
              },
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("does NOT require registration_number when motor_type is '2' (in transit)", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          fleet_details: [
            {
              ...validFleetDetailEntry,
              motor_details: {
                ...validFleetDetailEntry.motor_details,
                motor_type: "2",
                registration_number: undefined,
              },
            },
          ],
        }),
      ),
    ).not.toThrow();
  });

  // --- Endorsement rules ---
  it("throws when type '3' without endorsement_type per vehicle", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          covernote_type: "3",
          fleet_details: [
            {
              ...validFleetDetailEntry,
              previous_covernote_reference_number: "CN-REF-001",
              endorsement_reason: "change",
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when type '3' without endorsement_reason per vehicle", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          covernote_type: "3",
          fleet_details: [
            {
              ...validFleetDetailEntry,
              previous_covernote_reference_number: "CN-REF-001",
              endorsement_type: "1",
              endorsement_reason: undefined,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  // --- Previous covernote reference ---
  it("throws when type '2' without previous_covernote_reference_number per vehicle", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          covernote_type: "2",
          fleet_details: [
            {
              ...validFleetDetailEntry,
              previous_covernote_reference_number: undefined,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("type '1' does NOT require previous_covernote_reference_number", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          covernote_type: "1",
          fleet_details: [
            {
              ...validFleetDetailEntry,
              previous_covernote_reference_number: undefined,
            },
          ],
        }),
      ),
    ).not.toThrow();
  });

  // --- Year of manufacture ---
  it("throws on year_of_manufacture below 1900", () => {
    expect(() =>
      validateMotorFleetCoverNotePayload(
        fleet({
          fleet_details: [
            {
              ...validFleetDetailEntry,
              motor_details: {
                ...validFleetDetailEntry.motor_details,
                year_of_manufacture: 1800,
              },
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });
});
