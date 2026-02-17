import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validateClaimAssessmentPayload } from "../validation/claim-assessment.js";
import { validClaimAssessmentPayload } from "./fixtures.js";
import type { ClaimAssessmentPayload } from "../types/claim-assessment.js";

function ca(
  overrides: Partial<ClaimAssessmentPayload> = {},
): ClaimAssessmentPayload {
  return { ...validClaimAssessmentPayload, ...overrides };
}

describe("validateClaimAssessmentPayload", () => {
  it("valid complete payload passes", () => {
    expect(() =>
      validateClaimAssessmentPayload(validClaimAssessmentPayload),
    ).not.toThrow();
  });

  // --- Required header fields ---
  it("throws when request_id is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ request_id: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ callback_url: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url uses HTTP", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({ callback_url: "http://example.com/cb" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when insurer_company_code is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ insurer_company_code: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Detail fields ---
  it("throws when claim_assessment_number is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ claim_assessment_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_intimation_number is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ claim_intimation_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_reference_number is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ claim_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when covernote_reference_number is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ covernote_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when assessment_received_date is invalid", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({ assessment_received_date: "not-a-date" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for assessment_received_date", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({ assessment_received_date: new Date("2020-09-10T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  it("throws when assessment_report_summary is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ assessment_report_summary: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_approval_date is invalid", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({ claim_approval_date: "not-a-date" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for claim_approval_date", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({ claim_approval_date: new Date("2020-09-10T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  it("throws when claim_approval_authority is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ claim_approval_authority: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Enum validation ---
  it("throws when is_re_assessment is invalid", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({ is_re_assessment: "X" as any }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts is_re_assessment Y", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ is_re_assessment: "Y" })),
    ).not.toThrow();
  });

  it("accepts is_re_assessment N", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ is_re_assessment: "N" })),
    ).not.toThrow();
  });

  // --- Claimants ---
  it("throws when claimants array is empty", () => {
    expect(() =>
      validateClaimAssessmentPayload(ca({ claimants: [] })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_category is invalid", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({
          claimants: [
            {
              ...validClaimAssessmentPayload.claimants[0]!,
              claimant_category: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_type is invalid", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({
          claimants: [
            {
              ...validClaimAssessmentPayload.claimants[0]!,
              claimant_type: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_number is missing", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({
          claimants: [
            {
              ...validClaimAssessmentPayload.claimants[0]!,
              claimant_id_number: "",
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_type is invalid", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({
          claimants: [
            {
              ...validClaimAssessmentPayload.claimants[0]!,
              claimant_id_type: "9" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts payload with optional fields omitted", () => {
    expect(() =>
      validateClaimAssessmentPayload(
        ca({
          currency_code: undefined,
          exchange_rate: undefined,
        }),
      ),
    ).not.toThrow();
  });
});
