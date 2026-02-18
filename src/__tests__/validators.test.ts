import { describe, it, expect } from "vitest";
import { TiraValidationError } from "../errors.js";
import {
  validateRequired,
  validateEnum,
  validatePositiveNumber,
  validateNumber,
  validateDateString,
  validateDateRange,
  validatePhoneNumber,
  validateEmail,
  validateUrl,
  validateTaxesCharged,
} from "../validation/validators.js";

describe("validateRequired", () => {
  it("throws on undefined", () => {
    expect(() => validateRequired(undefined, "field")).toThrow(TiraValidationError);
  });

  it("throws on null", () => {
    expect(() => validateRequired(null, "field")).toThrow(TiraValidationError);
  });

  it("throws on empty string", () => {
    expect(() => validateRequired("", "field")).toThrow(TiraValidationError);
  });

  it("sets .field on the error", () => {
    try {
      validateRequired("", "callback_url");
    } catch (e) {
      expect(e).toBeInstanceOf(TiraValidationError);
      expect((e as TiraValidationError).field).toBe("callback_url");
    }
  });

  it("does not throw on '0'", () => {
    expect(() => validateRequired("0", "field")).not.toThrow();
  });

  it("does not throw on 0", () => {
    expect(() => validateRequired(0, "field")).not.toThrow();
  });

  it("does not throw on false", () => {
    expect(() => validateRequired(false, "field")).not.toThrow();
  });
});

describe("validateEnum", () => {
  const options = { "1": "New", "2": "Renewal", "3": "Endorsement" };

  it("throws on value not in options", () => {
    expect(() => validateEnum("4", options, "covernote_type")).toThrow(TiraValidationError);
  });

  it("throws on empty string", () => {
    expect(() => validateEnum("", options, "covernote_type")).toThrow(TiraValidationError);
  });

  it("error message lists allowed values with descriptions", () => {
    try {
      validateEnum("bad", options, "covernote_type");
    } catch (e) {
      const msg = (e as TiraValidationError).message;
      expect(msg).toContain("'1' (New)");
      expect(msg).toContain("'2' (Renewal)");
      expect(msg).toContain("'3' (Endorsement)");
    }
  });

  it("accepts valid value", () => {
    expect(() => validateEnum("1", options, "covernote_type")).not.toThrow();
    expect(() => validateEnum("2", options, "covernote_type")).not.toThrow();
    expect(() => validateEnum("3", options, "covernote_type")).not.toThrow();
  });
});

describe("validatePositiveNumber", () => {
  it("throws on 0", () => {
    expect(() => validatePositiveNumber(0, "premium")).toThrow(TiraValidationError);
  });

  it("throws on negative number", () => {
    expect(() => validatePositiveNumber(-100, "premium")).toThrow(TiraValidationError);
  });

  it("throws on NaN", () => {
    expect(() => validatePositiveNumber(NaN, "premium")).toThrow(TiraValidationError);
  });

  it("accepts positive number", () => {
    expect(() => validatePositiveNumber(525000, "premium")).not.toThrow();
  });
});

describe("validateNumber", () => {
  it("throws on NaN", () => {
    expect(() => validateNumber(NaN, "sum_insured")).toThrow(TiraValidationError);
  });

  it("accepts 0", () => {
    expect(() => validateNumber(0, "tax_amount")).not.toThrow();
  });

  it("accepts negative", () => {
    expect(() => validateNumber(-50, "discount")).not.toThrow();
  });
});

describe("validateDateString", () => {
  it("throws on 'not-a-date'", () => {
    expect(() => validateDateString("not-a-date", "start_date")).toThrow(TiraValidationError);
  });

  it("throws on empty string", () => {
    expect(() => validateDateString("", "start_date")).toThrow(TiraValidationError);
  });

  it("accepts ISO date string", () => {
    expect(() => validateDateString("2025-01-01T00:00:00.000Z", "start_date")).not.toThrow();
  });

  it("accepts date-only string", () => {
    expect(() => validateDateString("2025-01-01", "start_date")).not.toThrow();
  });
});

describe("validateDateRange", () => {
  it("throws when end date equals start date", () => {
    expect(() => validateDateRange("2025-06-01", "2025-06-01")).toThrow(TiraValidationError);
  });

  it("throws when end date is before start date", () => {
    expect(() => validateDateRange("2025-06-01", "2024-06-01")).toThrow(TiraValidationError);
  });

  it("error field is 'covernote_end_date'", () => {
    try {
      validateDateRange("2025-06-01", "2024-06-01");
    } catch (e) {
      expect((e as TiraValidationError).field).toBe("covernote_end_date");
    }
  });

  it("accepts end date after start date", () => {
    expect(() => validateDateRange("2025-06-01", "2026-06-01")).not.toThrow();
  });
});

describe("validatePhoneNumber", () => {
  it("throws on 10-digit number (local format)", () => {
    expect(() => validatePhoneNumber("0712345678", "phone")).toThrow(TiraValidationError);
  });

  it("throws on number with spaces", () => {
    expect(() => validatePhoneNumber("255 712 3456", "phone")).toThrow(TiraValidationError);
  });

  it("throws on number with + prefix", () => {
    expect(() => validatePhoneNumber("+25571234567", "phone")).toThrow(TiraValidationError);
  });

  it("throws on 13-digit number", () => {
    expect(() => validatePhoneNumber("2557123456789", "phone")).toThrow(TiraValidationError);
  });

  it("accepts exactly 12 digits", () => {
    expect(() => validatePhoneNumber("255712345678", "phone")).not.toThrow();
  });
});

describe("validateEmail", () => {
  it("throws on 'notanemail'", () => {
    expect(() => validateEmail("notanemail", "email")).toThrow(TiraValidationError);
  });

  it("throws on 'user@'", () => {
    expect(() => validateEmail("user@", "email")).toThrow(TiraValidationError);
  });

  it("accepts valid email", () => {
    expect(() => validateEmail("user@domain.com", "email")).not.toThrow();
  });
});

describe("validateUrl", () => {
  it("accepts HTTP URL", () => {
    expect(() => validateUrl("http://example.com/callback", "callback_url")).not.toThrow();
  });

  it("accepts HTTPS URL", () => {
    expect(() => validateUrl("https://example.com/callback", "callback_url")).not.toThrow();
  });

  it("throws on empty string", () => {
    expect(() => validateUrl("", "callback_url")).toThrow(TiraValidationError);
  });

  it("throws on non-URL string", () => {
    expect(() => validateUrl("not-a-url", "callback_url")).toThrow(TiraValidationError);
  });
});

describe("validateTaxesCharged", () => {
  it("throws on empty array", () => {
    expect(() => validateTaxesCharged([], "risks_covered[0]")).toThrow(TiraValidationError);
  });

  it("throws on non-array", () => {
    expect(() => validateTaxesCharged({} as any, "risks_covered[0]")).toThrow(TiraValidationError);
  });

  it("throws when exempted but no tax_exemption_type", () => {
    expect(() =>
      validateTaxesCharged(
        [{ tax_code: "VAT", is_tax_exempted: "Y", tax_rate: 0, tax_amount: 0 }],
        "risks_covered[0]",
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when exempted with invalid tax_exemption_type", () => {
    expect(() =>
      validateTaxesCharged(
        [
          {
            tax_code: "VAT",
            is_tax_exempted: "Y",
            tax_exemption_type: "3" as any,
            tax_exemption_reference: "REF-001",
            tax_rate: 0,
            tax_amount: 0,
          },
        ],
        "risks_covered[0]",
      ),
    ).toThrow(TiraValidationError);
  });

  it("throws when exempted but no tax_exemption_reference", () => {
    expect(() =>
      validateTaxesCharged(
        [
          {
            tax_code: "VAT",
            is_tax_exempted: "Y",
            tax_exemption_type: "1",
            tax_rate: 0,
            tax_amount: 0,
          },
        ],
        "risks_covered[0]",
      ),
    ).toThrow(TiraValidationError);
  });

  it("accepts valid non-exempted tax entry", () => {
    expect(() =>
      validateTaxesCharged(
        [{ tax_code: "VAT-MAINLAND", is_tax_exempted: "N", tax_rate: 0.18, tax_amount: 94500 }],
        "risks_covered[0]",
      ),
    ).not.toThrow();
  });

  it("accepts valid exempted tax entry with all fields", () => {
    expect(() =>
      validateTaxesCharged(
        [
          {
            tax_code: "VAT",
            is_tax_exempted: "Y",
            tax_exemption_type: "1",
            tax_exemption_reference: "REF-001",
            tax_rate: 0,
            tax_amount: 0,
          },
        ],
        "risks_covered[0]",
      ),
    ).not.toThrow();
  });

  it("error field includes index for second invalid entry", () => {
    try {
      validateTaxesCharged(
        [
          { tax_code: "VAT-MAINLAND", is_tax_exempted: "N", tax_rate: 0.18, tax_amount: 94500 },
          { tax_code: "", is_tax_exempted: "N", tax_rate: 0.18, tax_amount: 94500 },
        ],
        "risks_covered[0]",
      );
    } catch (e) {
      expect((e as TiraValidationError).field).toContain("[1]");
    }
  });
});
