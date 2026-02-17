import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validateDischargeVoucherPayload } from "../validation/discharge-voucher.js";
import { validDischargeVoucherPayload } from "./fixtures.js";
import type { DischargeVoucherPayload } from "../types/discharge-voucher.js";

function dv(
  overrides: Partial<DischargeVoucherPayload> = {},
): DischargeVoucherPayload {
  return { ...validDischargeVoucherPayload, ...overrides };
}

describe("validateDischargeVoucherPayload", () => {
  it("valid complete payload passes", () => {
    expect(() =>
      validateDischargeVoucherPayload(validDischargeVoucherPayload),
    ).not.toThrow();
  });

  // --- Required header fields ---
  it("throws when request_id is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ request_id: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ callback_url: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url uses HTTP", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ callback_url: "http://example.com/cb" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when insurer_company_code is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ insurer_company_code: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Detail string fields ---
  it("throws when discharge_voucher_number is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ discharge_voucher_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_assessment_number is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ claim_assessment_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claim_reference_number is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ claim_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when covernote_reference_number is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ covernote_reference_number: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when adjustment_reason is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ adjustment_reason: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when reconciliation_summary is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ reconciliation_summary: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Date fields ---
  it("throws when discharge_voucher_date is invalid", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ discharge_voucher_date: "not-a-date" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for discharge_voucher_date", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ discharge_voucher_date: new Date("2020-09-10T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  it("throws when claim_offer_communication_date is invalid", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ claim_offer_communication_date: "not-a-date" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for claim_offer_communication_date", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({
          claim_offer_communication_date: new Date("2020-09-10T13:55:22Z"),
        }),
      ),
    ).not.toThrow();
  });

  it("throws when claimant_response_date is invalid", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ claimant_response_date: "not-a-date" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for claimant_response_date", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ claimant_response_date: new Date("2020-09-10T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  it("throws when adjustment_date is invalid", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ adjustment_date: "not-a-date" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for adjustment_date", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ adjustment_date: new Date("2020-09-10T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  it("throws when reconciliation_date is invalid", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ reconciliation_date: "not-a-date" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for reconciliation_date", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ reconciliation_date: new Date("2020-09-10T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  // --- Enum validation ---
  it("throws when offer_accepted is invalid", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({ offer_accepted: "X" as any }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts offer_accepted Y", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ offer_accepted: "Y" })),
    ).not.toThrow();
  });

  it("accepts offer_accepted N", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ offer_accepted: "N" })),
    ).not.toThrow();
  });

  // --- Claimants ---
  it("throws when claimants array is empty", () => {
    expect(() =>
      validateDischargeVoucherPayload(dv({ claimants: [] })),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_category is invalid", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({
          claimants: [
            {
              ...validDischargeVoucherPayload.claimants[0]!,
              claimant_category: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_type is invalid", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({
          claimants: [
            {
              ...validDischargeVoucherPayload.claimants[0]!,
              claimant_type: "5" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_number is missing", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({
          claimants: [
            {
              ...validDischargeVoucherPayload.claimants[0]!,
              claimant_id_number: "",
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when claimant_id_type is invalid", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({
          claimants: [
            {
              ...validDischargeVoucherPayload.claimants[0]!,
              claimant_id_type: "9" as any,
            },
          ],
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts payload with optional fields omitted", () => {
    expect(() =>
      validateDischargeVoucherPayload(
        dv({
          currency_code: undefined,
          exchange_rate: undefined,
        }),
      ),
    ).not.toThrow();
  });
});
