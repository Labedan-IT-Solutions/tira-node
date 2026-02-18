import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validateClaimIntimationPayload } from "../validation/claim-intimation.js";
import { validClaimIntimationPayload } from "./fixtures.js";
import type { ClaimIntimationPayload } from "../types/claim-intimation.js";

function ci(
  overrides: Partial<ClaimIntimationPayload> = {},
): ClaimIntimationPayload {
  return { ...validClaimIntimationPayload, ...overrides };
}

describe("validateClaimIntimationPayload", () => {
  it("valid complete payload passes", () => {
    expect(() =>
      validateClaimIntimationPayload(validClaimIntimationPayload),
    ).not.toThrow();
  });

  // --- Required header fields ---
  it("throws when request_id is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ request_id: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ callback_url: "" })),
    ).toThrow(TiraValidationError);
  });

  it("accepts HTTP callback_url", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({ callback_url: "http://example.com/cb" }),
      ),
    ).not.toThrow();
  });

  it("throws when insurer_company_code is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ insurer_company_code: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Detail fields ---
  it("throws when claim_intimation_number is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ claim_intimation_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_reference_number is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ claim_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when covernote_reference_number is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ covernote_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_intimation_date is invalid", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({ claim_intimation_date: "not-a-date" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for claim_intimation_date", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({ claim_intimation_date: new Date("2020-09-10T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  it("throws when claim_reserve_method is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ claim_reserve_method: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when assessor_name is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ assessor_name: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when assessor_id_number is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ assessor_id_number: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Enum validation ---
  it("throws when loss_assessment_option is invalid", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({ loss_assessment_option: "3" as any }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts loss_assessment_option 1", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ loss_assessment_option: "1" })),
    ).not.toThrow();
  });

  it("accepts loss_assessment_option 2", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ loss_assessment_option: "2" })),
    ).not.toThrow();
  });

  it("throws when assessor_id_type is invalid", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ assessor_id_type: "9" as any })),
    ).toThrow(TiraValidationError);
  });

  // --- Claimants ---
  it("throws when claimants array is empty", () => {
    expect(() =>
      validateClaimIntimationPayload(ci({ claimants: [] })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_name is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          claimants: [
            { ...validClaimIntimationPayload.claimants[0]!, claimant_name: "" },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_birth_date is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          claimants: [
            {
              ...validClaimIntimationPayload.claimants[0]!,
              claimant_birth_date: "",
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_category is invalid", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          claimants: [
            {
              ...validClaimIntimationPayload.claimants[0]!,
              claimant_category: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_type is invalid", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          claimants: [
            {
              ...validClaimIntimationPayload.claimants[0]!,
              claimant_type: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_number is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          claimants: [
            {
              ...validClaimIntimationPayload.claimants[0]!,
              claimant_id_number: "",
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_type is invalid", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          claimants: [
            {
              ...validClaimIntimationPayload.claimants[0]!,
              claimant_id_type: "9" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant district is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          claimants: [
            { ...validClaimIntimationPayload.claimants[0]!, district: "" },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant region is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          claimants: [
            { ...validClaimIntimationPayload.claimants[0]!, region: "" },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_phone_number is missing", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          claimants: [
            {
              ...validClaimIntimationPayload.claimants[0]!,
              claimant_phone_number: "",
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts payload with optional fields omitted", () => {
    expect(() =>
      validateClaimIntimationPayload(
        ci({
          currency_code: undefined,
          exchange_rate: undefined,
        }),
      ),
    ).not.toThrow();
  });
});
