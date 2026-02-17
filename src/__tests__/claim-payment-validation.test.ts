import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validateClaimPaymentPayload } from "../validation/claim-payment.js";
import { validClaimPaymentPayload } from "./fixtures.js";
import type { ClaimPaymentPayload } from "../types/claim-payment.js";

function cp(
  overrides: Partial<ClaimPaymentPayload> = {},
): ClaimPaymentPayload {
  return { ...validClaimPaymentPayload, ...overrides };
}

describe("validateClaimPaymentPayload", () => {
  it("valid complete payload passes", () => {
    expect(() =>
      validateClaimPaymentPayload(validClaimPaymentPayload),
    ).not.toThrow();
  });

  // --- Required header fields ---
  it("throws when request_id is missing", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ request_id: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url is missing", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ callback_url: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url uses HTTP", () => {
    expect(() =>
      validateClaimPaymentPayload(
        cp({ callback_url: "http://example.com/cb" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when insurer_company_code is missing", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ insurer_company_code: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Detail string fields ---
  it("throws when claim_payment_number is missing", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ claim_payment_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_reference_number is missing", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ claim_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_intimation_number is missing", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ claim_intimation_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when covernote_reference_number is missing", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ covernote_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when litigation_reason is missing", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ litigation_reason: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Date fields ---
  it("throws when payment_date is invalid", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ payment_date: "not-a-date" })),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for payment_date", () => {
    expect(() =>
      validateClaimPaymentPayload(
        cp({ payment_date: new Date("2020-09-10T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  // --- Numeric fields ---
  it("throws when paid_amount is not a number", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ paid_amount: NaN })),
    ).toThrow(TiraValidationError);
  });

  it("throws when net_premium_earned is not a number", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ net_premium_earned: NaN })),
    ).toThrow(TiraValidationError);
  });

  // --- Enum validation ---
  it("throws when payment_mode is invalid", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ payment_mode: "5" as any })),
    ).toThrow(TiraValidationError);
  });

  it("accepts payment_mode 1", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ payment_mode: "1" })),
    ).not.toThrow();
  });

  it("accepts payment_mode 2", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ payment_mode: "2" })),
    ).not.toThrow();
  });

  it("accepts payment_mode 3", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ payment_mode: "3" })),
    ).not.toThrow();
  });

  it("throws when parties_notified is invalid", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ parties_notified: "X" as any })),
    ).toThrow(TiraValidationError);
  });

  it("accepts parties_notified Y", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ parties_notified: "Y" })),
    ).not.toThrow();
  });

  it("accepts parties_notified N", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ parties_notified: "N" })),
    ).not.toThrow();
  });

  it("throws when claim_resulted_litigation is invalid", () => {
    expect(() =>
      validateClaimPaymentPayload(
        cp({ claim_resulted_litigation: "X" as any }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts claim_resulted_litigation Y", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ claim_resulted_litigation: "Y" })),
    ).not.toThrow();
  });

  it("accepts claim_resulted_litigation N", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ claim_resulted_litigation: "N" })),
    ).not.toThrow();
  });

  // --- Claimants ---
  it("throws when claimants array is empty", () => {
    expect(() =>
      validateClaimPaymentPayload(cp({ claimants: [] })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_category is invalid", () => {
    expect(() =>
      validateClaimPaymentPayload(
        cp({
          claimants: [
            {
              ...validClaimPaymentPayload.claimants[0]!,
              claimant_category: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_type is invalid", () => {
    expect(() =>
      validateClaimPaymentPayload(
        cp({
          claimants: [
            {
              ...validClaimPaymentPayload.claimants[0]!,
              claimant_type: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_number is missing", () => {
    expect(() =>
      validateClaimPaymentPayload(
        cp({
          claimants: [
            {
              ...validClaimPaymentPayload.claimants[0]!,
              claimant_id_number: "",
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_type is invalid", () => {
    expect(() =>
      validateClaimPaymentPayload(
        cp({
          claimants: [
            {
              ...validClaimPaymentPayload.claimants[0]!,
              claimant_id_type: "9" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts payload with optional fields omitted", () => {
    expect(() =>
      validateClaimPaymentPayload(
        cp({
          currency_code: undefined,
          exchange_rate: undefined,
        }),
      ),
    ).not.toThrow();
  });
});
