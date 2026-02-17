import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildMotorCoverNoteXml, buildMotorVerificationXml } from "../builders/motor.js";
import { validCoverNotePayload, validVerificationPayload, mockTiraConfig } from "./fixtures.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildMotorCoverNoteXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildMotorCoverNoteXml(validCoverNotePayload, mockTiraConfig);
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is MotorCoverNoteRefReq", async () => {
    const xml = buildMotorCoverNoteXml(validCoverNotePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("MotorCoverNoteRefReq");
  });

  it("CoverNoteHdr contains config fields", async () => {
    const xml = buildMotorCoverNoteXml(validCoverNotePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.MotorCoverNoteRefReq.CoverNoteHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
    expect(hdr.RequestId).toBe(validCoverNotePayload.request_id);
    expect(hdr.TranCompanyCode).toBe(mockTiraConfig.transacting_company_code);
  });

  it("premium values are formatted with .toFixed(2)", async () => {
    const xml = buildMotorCoverNoteXml(validCoverNotePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl;
    expect(dtl.TotalPremiumExcludingTax).toBe("525000.00");
    expect(dtl.TotalPremiumIncludingTax).toBe("619500.00");
  });

  it("premium rate is formatted with .toFixed(5)", async () => {
    const xml = buildMotorCoverNoteXml(validCoverNotePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const risk = parsed.MotorCoverNoteRefReq.CoverNoteDtl.RisksCovered.RiskCovered;
    expect(risk.PremiumRate).toBe("0.03500");
  });

  it("defaults currency_code to 'TZS' when not provided", async () => {
    const payload = { ...validCoverNotePayload, currency_code: undefined };
    const xml = buildMotorCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.MotorCoverNoteRefReq.CoverNoteDtl.CurrencyCode).toBe("TZS");
  });

  it("defaults exchange_rate to '1.00' when not provided", async () => {
    const payload = { ...validCoverNotePayload, exchange_rate: undefined };
    const xml = buildMotorCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.MotorCoverNoteRefReq.CoverNoteDtl.ExchangeRate).toBe("1.00");
  });

  it("uses provided currency_code and exchange_rate", async () => {
    const payload = { ...validCoverNotePayload, currency_code: "USD", exchange_rate: 2500.5 };
    const xml = buildMotorCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.MotorCoverNoteRefReq.CoverNoteDtl.CurrencyCode).toBe("USD");
    expect(parsed.MotorCoverNoteRefReq.CoverNoteDtl.ExchangeRate).toBe("2500.50");
  });

  it("dates are formatted as YYYY-MM-DDTHH:MM:SS — no Z, no milliseconds", async () => {
    const xml = buildMotorCoverNoteXml(validCoverNotePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl;
    expect(dtl.CoverNoteStartDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    expect(dtl.CoverNoteEndDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });

  it("dates are converted from UTC to GMT+3 (EAT)", async () => {
    const payload = {
      ...validCoverNotePayload,
      covernote_start_date: "2025-05-31T21:00:00Z",
      covernote_end_date: "2026-05-31T21:00:00Z",
    };
    const xml = buildMotorCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl;
    expect(dtl.CoverNoteStartDate).toBe("2025-06-01T00:00:00");
    expect(dtl.CoverNoteEndDate).toBe("2026-06-01T00:00:00");
  });

  it("UTC midnight becomes 03:00:00 in GMT+3", async () => {
    const payload = {
      ...validCoverNotePayload,
      covernote_start_date: "2025-06-01T00:00:00Z",
      covernote_end_date: "2026-06-01T00:00:00Z",
    };
    const xml = buildMotorCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl;
    expect(dtl.CoverNoteStartDate).toBe("2025-06-01T03:00:00");
    expect(dtl.CoverNoteEndDate).toBe("2026-06-01T03:00:00");
  });

  it("accepts Date objects and converts to GMT+3", async () => {
    const payload = {
      ...validCoverNotePayload,
      covernote_start_date: new Date("2025-05-31T21:00:00Z"),
      covernote_end_date: new Date("2026-05-31T21:00:00Z"),
    };
    const xml = buildMotorCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl;
    expect(dtl.CoverNoteStartDate).toBe("2025-06-01T00:00:00");
    expect(dtl.CoverNoteEndDate).toBe("2026-06-01T00:00:00");
  });

  it("country_code defaults to 'TZA' for policy holder", async () => {
    const payload = {
      ...validCoverNotePayload,
      policy_holders: [{ ...validCoverNotePayload.policy_holders[0]!, country_code: undefined }],
    };
    const xml = buildMotorCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const ph = parsed.MotorCoverNoteRefReq.CoverNoteDtl.PolicyHolders.PolicyHolder;
    expect(ph.CountryCode).toBe("TZA");
  });

  it("optional commission fields default to empty string when undefined", async () => {
    const payload = {
      ...validCoverNotePayload,
      commission_paid: undefined,
      commission_rate: undefined,
    };
    const xml = buildMotorCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl;
    expect(dtl.CommisionPaid).toBe("");
    expect(dtl.CommisionRate).toBe("");
  });

  it("optional endorsement fields default to empty string", async () => {
    const xml = buildMotorCoverNoteXml(validCoverNotePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl;
    expect(dtl.EndorsementType).toBe("");
    expect(dtl.EndorsementReason).toBe("");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildMotorCoverNoteXml(validCoverNotePayload, mockTiraConfig);
    expect(xml).not.toMatch(/^<\?xml/);
  });

  it("tax amount is formatted with .toFixed(2)", async () => {
    const xml = buildMotorCoverNoteXml(validCoverNotePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const risk = parsed.MotorCoverNoteRefReq.CoverNoteDtl.RisksCovered.RiskCovered;
    const tax = risk.TaxesCharged.TaxCharged;
    expect(tax.TaxAmount).toBe("94500.00");
    expect(tax.TaxRate).toBe("0.18000");
  });
});

describe("buildMotorVerificationXml", () => {
  it("root element is MotorVerificationReq", async () => {
    const xml = buildMotorVerificationXml(validVerificationPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("MotorVerificationReq");
  });

  it("VerificationHdr contains config fields", async () => {
    const xml = buildMotorVerificationXml(validVerificationPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.MotorVerificationReq.VerificationHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
    expect(hdr.RequestId).toBe(validVerificationPayload.request_id);
  });

  it("sets registration number and empty chassis when only registration provided", async () => {
    const xml = buildMotorVerificationXml(validVerificationPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorVerificationReq.VerificationDtl;
    expect(dtl.MotorRegistrationNumber).toBe("T337DSE");
    expect(dtl.MotorChassisNumber).toBe("");
  });

  it("sets chassis number and empty registration when only chassis provided", async () => {
    const payload = {
      request_id: "REQ-001",
      motor_category: "1" as const,
      motor_chassis_number: "ABC123456789",
    };
    const xml = buildMotorVerificationXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorVerificationReq.VerificationDtl;
    expect(dtl.MotorChassisNumber).toBe("ABC123456789");
    expect(dtl.MotorRegistrationNumber).toBe("");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildMotorVerificationXml(validVerificationPayload, mockTiraConfig);
    expect(xml).not.toMatch(/^<\?xml/);
  });
});
