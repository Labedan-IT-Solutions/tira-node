import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validateReinsurancePayload } from "../validation/reinsurance.js";
import { validReinsurancePayload, validReinsuranceDetail } from "./fixtures.js";
import type { ReinsurancePayload } from "../types/reinsurance.js";

function reins(
  overrides: Partial<ReinsurancePayload> = {},
): ReinsurancePayload {
  return { ...validReinsurancePayload, ...overrides };
}

describe("validateReinsurancePayload", () => {
  it("valid complete payload passes", () => {
    expect(() =>
      validateReinsurancePayload(validReinsurancePayload),
    ).not.toThrow();
  });

  // --- Required header fields ---
  it("throws when request_id is missing", () => {
    expect(() => validateReinsurancePayload(reins({ request_id: "" }))).toThrow(
      TiraValidationError,
    );
  });

  it("throws when callback_url is missing", () => {
    expect(() =>
      validateReinsurancePayload(reins({ callback_url: "" })),
    ).toThrow(TiraValidationError);
  });

  it("accepts HTTP callback_url", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({ callback_url: "http://example.com/cb" }),
      ),
    ).not.toThrow();
  });

  it("throws when insurer_company_code is missing", () => {
    expect(() =>
      validateReinsurancePayload(reins({ insurer_company_code: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when covernote_reference_number is missing", () => {
    expect(() =>
      validateReinsurancePayload(reins({ covernote_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when premium_including_tax is 0", () => {
    expect(() =>
      validateReinsurancePayload(reins({ premium_including_tax: 0 })),
    ).toThrow(TiraValidationError);
  });

  it("throws when premium_including_tax is negative", () => {
    expect(() =>
      validateReinsurancePayload(reins({ premium_including_tax: -100 })),
    ).toThrow(TiraValidationError);
  });

  it("throws when authorizing_officer_name is missing", () => {
    expect(() =>
      validateReinsurancePayload(reins({ authorizing_officer_name: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when authorizing_officer_title is missing", () => {
    expect(() =>
      validateReinsurancePayload(reins({ authorizing_officer_title: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when reinsurance_category is invalid", () => {
    expect(() =>
      validateReinsurancePayload(reins({ reinsurance_category: "9" as any })),
    ).toThrow(TiraValidationError);
  });

  // --- Reinsurance Details ---
  it("throws when reinsurance_details is empty", () => {
    expect(() =>
      validateReinsurancePayload(reins({ reinsurance_details: [] })),
    ).toThrow(TiraValidationError);
  });

  // --- Per-detail fields ---
  it("throws when participant_code is missing in detail", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, participant_code: "" },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when participant_type is invalid", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, participant_type: "9" as any },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when reinsurance_form is invalid", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, reinsurance_form: "5" as any },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when reinsurance_type is invalid", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, reinsurance_type: "9" as any },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when brokerage_commission is NaN", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, brokerage_commission: NaN },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when reinsurance_commission is NaN", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, reinsurance_commission: NaN },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when premium_share is NaN", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, premium_share: NaN },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws on invalid participation_date", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, participation_date: "not-a-date" },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date objects for participation_date", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            {
              ...validReinsuranceDetail,
              participation_date: new Date("2025-06-01T00:00:00Z"),
            },
          ],
        }),
      ),
    ).not.toThrow();
  });

  it("allows zero for brokerage_commission", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, brokerage_commission: 0 },
          ],
        }),
      ),
    ).not.toThrow();
  });

  it("allows zero for reinsurance_commission", () => {
    expect(() =>
      validateReinsurancePayload(
        reins({
          reinsurance_details: [
            { ...validReinsuranceDetail, reinsurance_commission: 0 },
          ],
        }),
      ),
    ).not.toThrow();
  });
});
