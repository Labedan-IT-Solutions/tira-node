import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validateClaimRejectionPayload } from "../validation/claim-rejection.js";
import { validClaimRejectionPayload } from "./fixtures.js";
import type { ClaimRejectionPayload } from "../types/claim-rejection.js";

function cr(
  overrides: Partial<ClaimRejectionPayload> = {},
): ClaimRejectionPayload {
  return { ...validClaimRejectionPayload, ...overrides };
}

describe("validateClaimRejectionPayload", () => {
  it("valid complete payload passes", () => {
    expect(() =>
      validateClaimRejectionPayload(validClaimRejectionPayload),
    ).not.toThrow();
  });

  // --- Required header fields ---
  it("throws when request_id is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ request_id: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ callback_url: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url uses HTTP", () => {
    expect(() =>
      validateClaimRejectionPayload(
        cr({ callback_url: "http://example.com/cb" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when insurer_company_code is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ insurer_company_code: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Detail string fields ---
  it("throws when claim_rejection_number is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ claim_rejection_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_reference_number is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ claim_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_intimation_number is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ claim_intimation_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when covernote_reference_number is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ covernote_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when rejection_reason is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ rejection_reason: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when currency_code is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ currency_code: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Date fields ---
  it("throws when rejection_date is invalid", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ rejection_date: "not-a-date" })),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for rejection_date", () => {
    expect(() =>
      validateClaimRejectionPayload(
        cr({ rejection_date: new Date("2020-09-10T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  // --- Numeric fields ---
  it("throws when claim_amount is not a number", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ claim_amount: NaN })),
    ).toThrow(TiraValidationError);
  });

  it("throws when exchange_rate is not a number", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ exchange_rate: NaN })),
    ).toThrow(TiraValidationError);
  });

  // --- Enum validation ---
  it("throws when claim_resulted_litigation is invalid", () => {
    expect(() =>
      validateClaimRejectionPayload(
        cr({ claim_resulted_litigation: "X" as any }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts claim_resulted_litigation Y", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ claim_resulted_litigation: "Y" })),
    ).not.toThrow();
  });

  it("accepts claim_resulted_litigation N", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ claim_resulted_litigation: "N" })),
    ).not.toThrow();
  });

  // --- Claimants ---
  it("throws when claimants array is empty", () => {
    expect(() =>
      validateClaimRejectionPayload(cr({ claimants: [] })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_category is invalid", () => {
    expect(() =>
      validateClaimRejectionPayload(
        cr({
          claimants: [
            {
              ...validClaimRejectionPayload.claimants[0]!,
              claimant_category: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_type is invalid", () => {
    expect(() =>
      validateClaimRejectionPayload(
        cr({
          claimants: [
            {
              ...validClaimRejectionPayload.claimants[0]!,
              claimant_type: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_number is missing", () => {
    expect(() =>
      validateClaimRejectionPayload(
        cr({
          claimants: [
            {
              ...validClaimRejectionPayload.claimants[0]!,
              claimant_id_number: "",
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_type is invalid", () => {
    expect(() =>
      validateClaimRejectionPayload(
        cr({
          claimants: [
            {
              ...validClaimRejectionPayload.claimants[0]!,
              claimant_id_type: "9" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });
});
