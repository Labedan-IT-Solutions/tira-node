import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildClaimRejectionXml } from "../builders/claim-rejection.js";
import { validClaimRejectionPayload, mockTiraConfig } from "./fixtures.js";
import { formatDateForTira } from "../utils.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildClaimRejectionXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is ClaimRejectionReq", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("ClaimRejectionReq");
  });

  it("ClaimRejectionHdr contains config fields", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimRejectionReq.ClaimRejectionHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
  });

  it("ClaimRejectionHdr contains payload fields", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimRejectionReq.ClaimRejectionHdr;
    expect(hdr.RequestId).toBe(validClaimRejectionPayload.request_id);
    expect(hdr.CallBackUrl).toBe(validClaimRejectionPayload.callback_url);
    expect(hdr.InsurerCompanyCode).toBe(
      validClaimRejectionPayload.insurer_company_code,
    );
  });

  it("ClaimRejectionDtl has all mandatory text fields", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimRejectionReq.ClaimRejectionDtl;
    expect(dtl.ClaimRejectionNumber).toBe("322WQ25234234");
    expect(dtl.ClaimReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.ClaimIntimationNumber).toBe("322WQ25234234");
    expect(dtl.CoverNoteReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.RejectionReason).toBe(
      "uvygyegrufgiufuwiefiuwieugfiuewfiuehiubfeiuwf",
    );
  });

  it("enum fields are mapped correctly", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimRejectionReq.ClaimRejectionDtl;
    expect(dtl.ClaimResultedLitigation).toBe("Y");
  });

  it("numeric fields are formatted to 2 decimal places", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimRejectionReq.ClaimRejectionDtl;
    expect(dtl.ClaimAmount).toBe("20000.00");
    expect(dtl.ExchangeRate).toBe("2000.00");
  });

  it("rejection_date is formatted via formatDateForTira", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimRejectionReq.ClaimRejectionDtl;
    const expected = formatDateForTira(
      validClaimRejectionPayload.rejection_date,
    );
    expect(dtl.RejectionDate).toBe(expected);
  });

  it("currency_code is rendered as provided", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimRejectionReq.ClaimRejectionDtl;
    expect(dtl.CurrencyCode).toBe("USD");
  });

  it("renders Claimants with multiple Claimant entries", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const claimants =
      parsed.ClaimRejectionReq.ClaimRejectionDtl.Claimants.Claimant;
    expect(Array.isArray(claimants)).toBe(true);
    expect(claimants).toHaveLength(2);
    expect(claimants[0].ClaimantIdNumber).toBe("24241241");
    expect(claimants[1].ClaimantIdNumber).toBe("3452525235525");
  });

  it("claimant fields are mapped correctly", async () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const c =
      parsed.ClaimRejectionReq.ClaimRejectionDtl.Claimants.Claimant[0];
    expect(c.ClaimantCategory).toBe("2");
    expect(c.ClaimantType).toBe("1");
    expect(c.ClaimantIdNumber).toBe("24241241");
    expect(c.ClaimantIdType).toBe("1");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildClaimRejectionXml(validClaimRejectionPayload, mockTiraConfig);
    expect(xml).not.toMatch(/^<\?xml/);
  });
});
