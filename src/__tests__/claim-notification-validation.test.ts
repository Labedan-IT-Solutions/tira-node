import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validateClaimNotificationPayload } from "../validation/claim-notification.js";
import { validClaimNotificationPayload } from "./fixtures.js";
import type { ClaimNotificationPayload } from "../types/claim-notification.js";

function cn(
  overrides: Partial<ClaimNotificationPayload> = {},
): ClaimNotificationPayload {
  return { ...validClaimNotificationPayload, ...overrides };
}

describe("validateClaimNotificationPayload", () => {
  it("valid complete payload passes", () => {
    expect(() =>
      validateClaimNotificationPayload(validClaimNotificationPayload),
    ).not.toThrow();
  });

  // --- Required header fields ---
  it("throws when request_id is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(cn({ request_id: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(cn({ callback_url: "" })),
    ).toThrow(TiraValidationError);
  });

  it("accepts HTTP callback_url", () => {
    expect(() =>
      validateClaimNotificationPayload(
        cn({ callback_url: "http://example.com/cb" }),
      ),
    ).not.toThrow();
  });

  it("throws when insurer_company_code is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(cn({ insurer_company_code: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Detail fields ---
  it("throws when claim_notification_number is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(
        cn({ claim_notification_number: "" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when covernote_reference_number is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(
        cn({ covernote_reference_number: "" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when loss_nature is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(cn({ loss_nature: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when loss_type is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(cn({ loss_type: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when loss_location is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(cn({ loss_location: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when officer_name is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(cn({ officer_name: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when officer_title is missing", () => {
    expect(() =>
      validateClaimNotificationPayload(cn({ officer_title: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Enum validation ---
  it("throws when claim_form_duly_filled is not Y or N", () => {
    expect(() =>
      validateClaimNotificationPayload(
        cn({ claim_form_duly_filled: "X" as any }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts Y for claim_form_duly_filled", () => {
    expect(() =>
      validateClaimNotificationPayload(
        cn({ claim_form_duly_filled: "Y" }),
      ),
    ).not.toThrow();
  });

  it("accepts N for claim_form_duly_filled", () => {
    expect(() =>
      validateClaimNotificationPayload(
        cn({ claim_form_duly_filled: "N" }),
      ),
    ).not.toThrow();
  });

  // --- Date validation ---
  it("throws when claim_report_date is invalid", () => {
    expect(() =>
      validateClaimNotificationPayload(
        cn({ claim_report_date: "not-a-date" }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when loss_date is invalid", () => {
    expect(() =>
      validateClaimNotificationPayload(cn({ loss_date: "not-a-date" })),
    ).toThrow(TiraValidationError);
  });

  it("accepts Date object for claim_report_date", () => {
    expect(() =>
      validateClaimNotificationPayload(
        cn({ claim_report_date: new Date("2020-09-15T13:55:22Z") }),
      ),
    ).not.toThrow();
  });

  it("accepts Date object for loss_date", () => {
    expect(() =>
      validateClaimNotificationPayload(
        cn({ loss_date: new Date("2020-09-15T13:55:22Z") }),
      ),
    ).not.toThrow();
  });
});
