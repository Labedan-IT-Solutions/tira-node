import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildMotorFleetCoverNoteXml } from "../builders/motor-fleet.js";
import { validFleetPayload, validFleetDetailEntry, mockTiraConfig } from "./fixtures.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildMotorFleetCoverNoteXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is MotorCoverNoteRefReq", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("MotorCoverNoteRefReq");
  });

  it("CoverNoteHdr contains config fields", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.MotorCoverNoteRefReq.CoverNoteHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
    expect(hdr.RequestId).toBe(validFleetPayload.request_id);
    expect(hdr.TranCompanyCode).toBe(mockTiraConfig.transacting_company_code);
  });

  it("FleetHdr contains fleet-specific fields", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const fleetHdr = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetHdr;
    expect(fleetHdr.FleetId).toBe("FLT-001");
    expect(fleetHdr.FleetType).toBe("1");
    expect(fleetHdr.FleetSize).toBe("2");
    expect(fleetHdr.SalePointCode).toBe("SP719");
    expect(fleetHdr.PaymentMode).toBe("3");
    expect(fleetHdr.OfficerName).toBe("Johnson Abraham");
    expect(fleetHdr.ProductCode).toBe("SP014001000000");
  });

  it("FleetDtl is an array matching fleet_details count", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetDtl;
    expect(Array.isArray(dtl)).toBe(true);
    expect(dtl).toHaveLength(2);
  });

  it("each FleetDtl entry has MotorDtl", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetDtl;
    expect(dtl[0].MotorDtl).toBeDefined();
    expect(dtl[0].MotorDtl.RegistrationNumber).toBe("T123ABC");
    expect(dtl[1].MotorDtl).toBeDefined();
    expect(dtl[1].MotorDtl.RegistrationNumber).toBe("T456DEF");
  });

  it("premium values are formatted with .toFixed(2)", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const fleetHdr = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetHdr;
    expect(fleetHdr.TotalPremiumExcludingTax).toBe("1050000.00");
    expect(fleetHdr.TotalPremiumIncludingTax).toBe("1239000.00");
  });

  it("commission defaults to '0.00' when not provided", async () => {
    const payload = {
      ...validFleetPayload,
      commission_paid: undefined,
      commission_rate: undefined,
    };
    const xml = buildMotorFleetCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const fleetHdr = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetHdr;
    expect(fleetHdr.CommisionPaid).toBe("0.00");
    expect(fleetHdr.CommisionRate).toBe("0.00");
  });

  it("defaults currency_code to 'TZS' when not provided", async () => {
    const payload = { ...validFleetPayload, currency_code: undefined };
    const xml = buildMotorFleetCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetHdr.CurrencyCode).toBe("TZS");
  });

  it("defaults exchange_rate to '1.00' when not provided", async () => {
    const payload = { ...validFleetPayload, exchange_rate: undefined };
    const xml = buildMotorFleetCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetHdr.ExchangeRate).toBe("1.00");
  });

  it("uses provided currency_code and exchange_rate", async () => {
    const payload = { ...validFleetPayload, currency_code: "USD", exchange_rate: 2500.5 };
    const xml = buildMotorFleetCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const fleetHdr = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetHdr;
    expect(fleetHdr.CurrencyCode).toBe("USD");
    expect(fleetHdr.ExchangeRate).toBe("2500.50");
  });

  it("dates are formatted as YYYY-MM-DDTHH:MM:SS — no Z, no milliseconds", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const fleetHdr = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetHdr;
    expect(fleetHdr.CoverNoteStartDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    expect(fleetHdr.CoverNoteEndDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });

  it("dates are converted from UTC to GMT+3 (EAT)", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const fleetHdr = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetHdr;
    expect(fleetHdr.CoverNoteStartDate).toBe("2025-06-01T00:00:00");
    expect(fleetHdr.CoverNoteEndDate).toBe("2026-06-01T00:00:00");
  });

  it("per-vehicle endorsement fields default to empty string", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetDtl[0];
    expect(dtl.EndorsementType).toBe("");
    expect(dtl.EndorsementReason).toBe("");
  });

  it("per-vehicle previous covernote reference defaults to empty string", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetDtl[0];
    expect(dtl.PrevCoverNoteReferenceNumber).toBe("");
  });

  it("includes RisksCovered per vehicle", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetDtl[0];
    expect(dtl.RisksCovered).toBeDefined();
    expect(dtl.RisksCovered.RiskCovered).toBeDefined();
  });

  it("includes SubjectMattersCovered per vehicle", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetDtl[0];
    expect(dtl.SubjectMattersCovered).toBeDefined();
    expect(dtl.SubjectMattersCovered.SubjectMatter).toBeDefined();
  });

  it("includes PolicyHolders in FleetHdr", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const fleetHdr = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetHdr;
    expect(fleetHdr.PolicyHolders).toBeDefined();
    expect(fleetHdr.PolicyHolders.PolicyHolder).toBeDefined();
    expect(fleetHdr.PolicyHolders.PolicyHolder.PolicyHolderName).toBe("FLEET OWNER");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    expect(xml).not.toMatch(/^<\?xml/);
  });

  it("premium rate is formatted with .toFixed(5)", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const risk = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetDtl[0].RisksCovered.RiskCovered;
    expect(risk.PremiumRate).toBe("0.03500");
  });

  it("tax amount is formatted with .toFixed(2)", async () => {
    const xml = buildMotorFleetCoverNoteXml(validFleetPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const risk = parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetDtl[0].RisksCovered.RiskCovered;
    const tax = risk.TaxesCharged.TaxCharged;
    expect(tax.TaxAmount).toBe("94500.00");
    expect(tax.TaxRate).toBe("0.18000");
  });

  it("single fleet detail is still valid XML", async () => {
    const payload = {
      ...validFleetPayload,
      fleet_size: 1,
      fleet_details: [validFleetDetailEntry],
    };
    const xml = buildMotorFleetCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.MotorCoverNoteRefReq.CoverNoteDtl.FleetDtl).toBeDefined();
  });
});
