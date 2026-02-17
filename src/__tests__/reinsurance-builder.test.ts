import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildReinsuranceXml } from "../builders/reinsurance.js";
import { validReinsurancePayload, validReinsuranceDetail, mockTiraConfig } from "./fixtures.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildReinsuranceXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is ReinsuranceReq", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("ReinsuranceReq");
  });

  it("ReinsuranceHdr contains config fields", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.ReinsuranceReq.ReinsuranceHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
  });

  it("ReinsuranceHdr contains payload fields", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.ReinsuranceReq.ReinsuranceHdr;
    expect(hdr.RequestId).toBe(validReinsurancePayload.request_id);
    expect(hdr.CallBackUrl).toBe(validReinsurancePayload.callback_url);
    expect(hdr.InsurerCompanyCode).toBe(validReinsurancePayload.insurer_company_code);
    expect(hdr.CoverNoteReferenceNumber).toBe(validReinsurancePayload.cover_note_reference_number);
    expect(hdr.AuthorizingOfficerName).toBe(validReinsurancePayload.authorizing_officer_name);
    expect(hdr.AuthorizingOfficerTitle).toBe(validReinsurancePayload.authorizing_officer_title);
    expect(hdr.ReinsuranceCategory).toBe(validReinsurancePayload.reinsurance_category);
  });

  it("premium value is formatted with .toFixed(2)", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.ReinsuranceReq.ReinsuranceHdr;
    expect(hdr.PremiumIncludingTax).toBe("619500.00");
  });

  it("defaults currency_code to 'TZS' when not provided", async () => {
    const payload = { ...validReinsurancePayload, currency_code: undefined };
    const xml = buildReinsuranceXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.ReinsuranceReq.ReinsuranceHdr.CurrencyCode).toBe("TZS");
  });

  it("defaults exchange_rate to '1.00' when not provided", async () => {
    const payload = { ...validReinsurancePayload, exchange_rate: undefined };
    const xml = buildReinsuranceXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.ReinsuranceReq.ReinsuranceHdr.ExchangeRate).toBe("1.00");
  });

  it("uses provided currency_code and exchange_rate", async () => {
    const payload = { ...validReinsurancePayload, currency_code: "USD", exchange_rate: 2500.5 };
    const xml = buildReinsuranceXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.ReinsuranceReq.ReinsuranceHdr;
    expect(hdr.CurrencyCode).toBe("USD");
    expect(hdr.ExchangeRate).toBe("2500.50");
  });

  it("ReinsuranceDtl is an array matching reinsurance_details count", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ReinsuranceReq.ReinsuranceDtl;
    expect(Array.isArray(dtl)).toBe(true);
    expect(dtl).toHaveLength(2);
  });

  it("each ReinsuranceDtl entry has correct fields", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ReinsuranceReq.ReinsuranceDtl[0];
    expect(dtl.ParticipantCode).toBe("RE001");
    expect(dtl.ParticipantType).toBe("1");
    expect(dtl.ReinsuranceForm).toBe("3");
    expect(dtl.ReinsuranceType).toBe("1");
    expect(dtl.ReBrokerCode).toBe("BRK001");
  });

  it("monetary detail fields are formatted with .toFixed(2)", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ReinsuranceReq.ReinsuranceDtl[0];
    expect(dtl.BrokerageCommission).toBe("5000.00");
    expect(dtl.ReinsuranceCommission).toBe("10000.00");
    expect(dtl.PremiumShare).toBe("250000.00");
  });

  it("ParticipationDate is formatted as YYYY-MM-DDTHH:MM:SS without Z", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ReinsuranceReq.ReinsuranceDtl[0];
    expect(dtl.ParticipationDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });

  it("ParticipationDate is converted from UTC to GMT+3", async () => {
    const payload = {
      ...validReinsurancePayload,
      reinsurance_details: [
        { ...validReinsuranceDetail, participation_date: "2025-05-31T21:00:00Z" },
      ],
    };
    const xml = buildReinsuranceXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ReinsuranceReq.ReinsuranceDtl;
    expect(dtl.ParticipationDate).toBe("2025-06-01T00:00:00");
  });

  it("accepts Date objects for participation_date", async () => {
    const payload = {
      ...validReinsurancePayload,
      reinsurance_details: [
        { ...validReinsuranceDetail, participation_date: new Date("2025-05-31T21:00:00Z") },
      ],
    };
    const xml = buildReinsuranceXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ReinsuranceReq.ReinsuranceDtl;
    expect(dtl.ParticipationDate).toBe("2025-06-01T00:00:00");
  });

  it("ReBrokerCode defaults to empty string when not provided", async () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ReinsuranceReq.ReinsuranceDtl[1];
    expect(dtl.ReBrokerCode).toBe("");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildReinsuranceXml(validReinsurancePayload, mockTiraConfig);
    expect(xml).not.toMatch(/^<\?xml/);
  });

  it("single reinsurance detail is still valid XML", async () => {
    const payload = {
      ...validReinsurancePayload,
      reinsurance_details: [validReinsuranceDetail],
    };
    const xml = buildReinsuranceXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.ReinsuranceReq.ReinsuranceDtl).toBeDefined();
  });
});
