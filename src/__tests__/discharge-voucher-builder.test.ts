import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildDischargeVoucherXml } from "../builders/discharge-voucher.js";
import { validDischargeVoucherPayload, mockTiraConfig } from "./fixtures.js";
import { formatDateForTira } from "../utils.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildDischargeVoucherXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is DischargeVoucherReq", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("DischargeVoucherReq");
  });

  it("DischargeVoucherHdr contains config fields", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.DischargeVoucherReq.DischargeVoucherHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
  });

  it("DischargeVoucherHdr contains payload fields", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.DischargeVoucherReq.DischargeVoucherHdr;
    expect(hdr.RequestId).toBe(validDischargeVoucherPayload.request_id);
    expect(hdr.CallBackUrl).toBe(validDischargeVoucherPayload.callback_url);
    expect(hdr.InsurerCompanyCode).toBe(
      validDischargeVoucherPayload.insurer_company_code,
    );
  });

  it("DischargeVoucherDtl has all mandatory text fields", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.DischargeVoucherReq.DischargeVoucherDtl;
    expect(dtl.DischargeVoucherNumber).toBe("322WQ25234234");
    expect(dtl.ClaimAssessmentNumber).toBe("322WQ252323423q4");
    expect(dtl.ClaimReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.CoverNoteReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.AdjustmentReason).toBe("vhrefhrehfohfiwhei");
    expect(dtl.ReconciliationSummary).toBe("vyuergviwfvwiuevuiwvfiubbegwe");
    expect(dtl.OfferAccepted).toBe("N");
  });

  it("numeric fields are formatted to 2 decimal places", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.DischargeVoucherReq.DischargeVoucherDtl;
    expect(dtl.ExchangeRate).toBe("2000.00");
    expect(dtl.ClaimOfferAmount).toBe("5000000.00");
    expect(dtl.AdjustmentAmount).toBe("1000000.00");
    expect(dtl.ReconciledAmount).toBe("200000.00");
  });

  it("discharge_voucher_date is formatted via formatDateForTira", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.DischargeVoucherReq.DischargeVoucherDtl;
    const expected = formatDateForTira(
      validDischargeVoucherPayload.discharge_voucher_date,
    );
    expect(dtl.DischargeVoucherDate).toBe(expected);
  });

  it("claim_offer_communication_date is formatted via formatDateForTira", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.DischargeVoucherReq.DischargeVoucherDtl;
    const expected = formatDateForTira(
      validDischargeVoucherPayload.claim_offer_communication_date,
    );
    expect(dtl.ClaimOfferCommunicationDate).toBe(expected);
  });

  it("claimant_response_date is formatted via formatDateForTira", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.DischargeVoucherReq.DischargeVoucherDtl;
    const expected = formatDateForTira(
      validDischargeVoucherPayload.claimant_response_date,
    );
    expect(dtl.ClaimantResponseDate).toBe(expected);
  });

  it("adjustment_date is formatted via formatDateForTira", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.DischargeVoucherReq.DischargeVoucherDtl;
    const expected = formatDateForTira(
      validDischargeVoucherPayload.adjustment_date,
    );
    expect(dtl.AdjustmentDate).toBe(expected);
  });

  it("reconciliation_date is formatted via formatDateForTira", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.DischargeVoucherReq.DischargeVoucherDtl;
    const expected = formatDateForTira(
      validDischargeVoucherPayload.reconciliation_date,
    );
    expect(dtl.ReconciliationDate).toBe(expected);
  });

  it("currency_code defaults to TZS when not provided", async () => {
    const payload = { ...validDischargeVoucherPayload, currency_code: undefined };
    const xml = buildDischargeVoucherXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.DischargeVoucherReq.DischargeVoucherDtl;
    expect(dtl.CurrencyCode).toBe("TZS");
  });

  it("exchange_rate defaults to 1.00 when not provided", async () => {
    const payload = { ...validDischargeVoucherPayload, exchange_rate: undefined };
    const xml = buildDischargeVoucherXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.DischargeVoucherReq.DischargeVoucherDtl;
    expect(dtl.ExchangeRate).toBe("1.00");
  });

  it("renders Claimants with multiple Claimant entries", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const claimants =
      parsed.DischargeVoucherReq.DischargeVoucherDtl.Claimants.Claimant;
    expect(Array.isArray(claimants)).toBe(true);
    expect(claimants).toHaveLength(2);
    expect(claimants[0].ClaimantIdNumber).toBe("24241241");
    expect(claimants[1].ClaimantIdNumber).toBe("3452525235525");
  });

  it("claimant fields are mapped correctly", async () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const c =
      parsed.DischargeVoucherReq.DischargeVoucherDtl.Claimants.Claimant[0];
    expect(c.ClaimantCategory).toBe("2");
    expect(c.ClaimantType).toBe("1");
    expect(c.ClaimantIdNumber).toBe("24241241");
    expect(c.ClaimantIdType).toBe("1");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildDischargeVoucherXml(
      validDischargeVoucherPayload,
      mockTiraConfig,
    );
    expect(xml).not.toMatch(/^<\?xml/);
  });
});
