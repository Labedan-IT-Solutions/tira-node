import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildClaimPaymentXml } from "../builders/claim-payment.js";
import { validClaimPaymentPayload, mockTiraConfig } from "./fixtures.js";
import { formatDateForTira } from "../utils.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildClaimPaymentXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is ClaimPaymentReq", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("ClaimPaymentReq");
  });

  it("ClaimPaymentHdr contains config fields", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimPaymentReq.ClaimPaymentHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
  });

  it("ClaimPaymentHdr contains payload fields", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimPaymentReq.ClaimPaymentHdr;
    expect(hdr.RequestId).toBe(validClaimPaymentPayload.request_id);
    expect(hdr.CallBackUrl).toBe(validClaimPaymentPayload.callback_url);
    expect(hdr.InsurerCompanyCode).toBe(
      validClaimPaymentPayload.insurer_company_code,
    );
  });

  it("ClaimPaymentDtl has all mandatory text fields", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimPaymentReq.ClaimPaymentDtl;
    expect(dtl.ClaimPaymentNumber).toBe("322WQ25234234");
    expect(dtl.ClaimReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.ClaimIntimationNumber).toBe("322WQ25234234");
    expect(dtl.CoverNoteReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.LitigationReason).toBe("gegewgwgwifubweufgweiyfgwiguwf");
  });

  it("enum fields are mapped correctly", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimPaymentReq.ClaimPaymentDtl;
    expect(dtl.PaymentMode).toBe("1");
    expect(dtl.PartiesNotified).toBe("Y");
    expect(dtl.ClaimResultedLitigation).toBe("Y");
  });

  it("numeric fields are formatted to 2 decimal places", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimPaymentReq.ClaimPaymentDtl;
    expect(dtl.PaidAmount).toBe("20000.00");
    expect(dtl.NetPremiumEarned).toBe("200.00");
  });

  it("payment_date is formatted via formatDateForTira", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimPaymentReq.ClaimPaymentDtl;
    const expected = formatDateForTira(
      validClaimPaymentPayload.payment_date,
    );
    expect(dtl.PaymentDate).toBe(expected);
  });

  it("currency_code defaults to TZS when not provided", async () => {
    const payload = { ...validClaimPaymentPayload, currency_code: undefined };
    const xml = buildClaimPaymentXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimPaymentReq.ClaimPaymentDtl;
    expect(dtl.CurrencyCode).toBe("TZS");
  });

  it("exchange_rate defaults to 1.00 when not provided", async () => {
    const payload = { ...validClaimPaymentPayload, exchange_rate: undefined };
    const xml = buildClaimPaymentXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimPaymentReq.ClaimPaymentDtl;
    expect(dtl.ExchangeRate).toBe("1.00");
  });

  it("renders Claimants with multiple Claimant entries", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const claimants =
      parsed.ClaimPaymentReq.ClaimPaymentDtl.Claimants.Claimant;
    expect(Array.isArray(claimants)).toBe(true);
    expect(claimants).toHaveLength(2);
    expect(claimants[0].ClaimantIdNumber).toBe("24241241");
    expect(claimants[1].ClaimantIdNumber).toBe("3452525235525");
  });

  it("claimant fields are mapped correctly", async () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const c =
      parsed.ClaimPaymentReq.ClaimPaymentDtl.Claimants.Claimant[0];
    expect(c.ClaimantCategory).toBe("2");
    expect(c.ClaimantType).toBe("1");
    expect(c.ClaimantIdNumber).toBe("24241241");
    expect(c.ClaimantIdType).toBe("1");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildClaimPaymentXml(validClaimPaymentPayload, mockTiraConfig);
    expect(xml).not.toMatch(/^<\?xml/);
  });
});
