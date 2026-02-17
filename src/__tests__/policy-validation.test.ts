import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import { validatePolicyPayload } from "../validation/policy.js";
import { validPolicyPayload, validPolicyDetail } from "./fixtures.js";
import type { PolicyPayload } from "../types/policy.js";

function pol(overrides: Partial<PolicyPayload> = {}): PolicyPayload {
  return { ...validPolicyPayload, ...overrides };
}

describe("validatePolicyPayload", () => {
  it("valid complete payload passes", () => {
    expect(() => validatePolicyPayload(validPolicyPayload)).not.toThrow();
  });

  // --- Required header fields ---
  it("throws when request_id is missing", () => {
    expect(() =>
      validatePolicyPayload(pol({ request_id: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url is missing", () => {
    expect(() =>
      validatePolicyPayload(pol({ callback_url: "" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when callback_url uses HTTP", () => {
    expect(() =>
      validatePolicyPayload(pol({ callback_url: "http://example.com/cb" })),
    ).toThrow(TiraValidationError);
  });

  it("throws when insurer_company_code is missing", () => {
    expect(() =>
      validatePolicyPayload(pol({ insurer_company_code: "" })),
    ).toThrow(TiraValidationError);
  });

  // --- Policy Detail ---
  it("throws when policy_detail is missing", () => {
    expect(() =>
      validatePolicyPayload(pol({ policy_detail: undefined as any })),
    ).toThrow(TiraValidationError);
  });

  // --- Detail fields ---
  it("throws when policy_number is missing in detail", () => {
    expect(() =>
      validatePolicyPayload(
        pol({
          policy_detail: { ...validPolicyDetail, policy_number: "" },
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when policy_operative_clause is missing in detail", () => {
    expect(() =>
      validatePolicyPayload(
        pol({
          policy_detail: { ...validPolicyDetail, policy_operative_clause: "" },
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when special_conditions is missing in detail", () => {
    expect(() =>
      validatePolicyPayload(
        pol({
          policy_detail: { ...validPolicyDetail, special_conditions: "" },
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when applied_cover_notes is empty", () => {
    expect(() =>
      validatePolicyPayload(
        pol({
          policy_detail: { ...validPolicyDetail, applied_cover_notes: [] },
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when applied_cover_notes contains empty string", () => {
    expect(() =>
      validatePolicyPayload(
        pol({
          policy_detail: { ...validPolicyDetail, applied_cover_notes: ["CN-001", ""] },
        }),
      ),
    ).toThrow(TiraValidationError);
  });

  // --- Optional / valid edge cases ---
  it("passes when exclusions is undefined", () => {
    expect(() =>
      validatePolicyPayload(
        pol({
          policy_detail: { ...validPolicyDetail, exclusions: undefined },
        }),
      ),
    ).not.toThrow();
  });

  it("passes with single applied cover note", () => {
    expect(() =>
      validatePolicyPayload(
        pol({
          policy_detail: { ...validPolicyDetail, applied_cover_notes: ["CN-001"] },
        }),
      ),
    ).not.toThrow();
  });
});
