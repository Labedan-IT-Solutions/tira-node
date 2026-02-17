import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildClaimNotificationXml } from "../builders/claim-notification.js";
import {
  validClaimNotificationPayload,
  mockTiraConfig,
} from "./fixtures.js";
import { formatDateForTira } from "../utils.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildClaimNotificationXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildClaimNotificationXml(
      validClaimNotificationPayload,
      mockTiraConfig,
    );
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is ClaimNotificationRefReq", async () => {
    const xml = buildClaimNotificationXml(
      validClaimNotificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("ClaimNotificationRefReq");
  });

  it("ClaimNotificationHdr contains config fields", async () => {
    const xml = buildClaimNotificationXml(
      validClaimNotificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimNotificationRefReq.ClaimNotificationHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
    expect(hdr.TranCompanyCode).toBe(mockTiraConfig.transacting_company_code);
  });

  it("ClaimNotificationHdr contains payload fields", async () => {
    const xml = buildClaimNotificationXml(
      validClaimNotificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimNotificationRefReq.ClaimNotificationHdr;
    expect(hdr.RequestId).toBe(validClaimNotificationPayload.request_id);
    expect(hdr.CallBackUrl).toBe(
      validClaimNotificationPayload.callback_url,
    );
    expect(hdr.InsurerCompanyCode).toBe(
      validClaimNotificationPayload.insurer_company_code,
    );
  });

  it("ClaimNotificationDtl is a single object (not array)", async () => {
    const xml = buildClaimNotificationXml(
      validClaimNotificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimNotificationRefReq.ClaimNotificationDtl;
    expect(Array.isArray(dtl)).toBe(false);
    expect(dtl).toBeDefined();
  });

  it("ClaimNotificationDtl has all text fields", async () => {
    const xml = buildClaimNotificationXml(
      validClaimNotificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimNotificationRefReq.ClaimNotificationDtl;
    expect(dtl.ClaimNotificationNumber).toBe("NIC00004");
    expect(dtl.CoverNoteReferenceNumber).toBe("3252-5252");
    expect(dtl.ClaimFormDullyFilled).toBe("Y");
    expect(dtl.LossNature).toBe("Fire and Allied Perils");
    expect(dtl.LossType).toBe("Bodily Injury");
    expect(dtl.LossLocation).toBe("Morogoro");
    expect(dtl.OfficerName).toBe("John Doe");
    expect(dtl.OfficerTitle).toBe("Underwriter");
  });

  it("dates are formatted via formatDateForTira", async () => {
    const xml = buildClaimNotificationXml(
      validClaimNotificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimNotificationRefReq.ClaimNotificationDtl;
    const expectedReportDate = formatDateForTira(
      validClaimNotificationPayload.claim_report_date,
    );
    const expectedLossDate = formatDateForTira(
      validClaimNotificationPayload.loss_date,
    );
    expect(dtl.ClaimReportDate).toBe(expectedReportDate);
    expect(dtl.LossDate).toBe(expectedLossDate);
  });

  it("accepts Date objects for date fields", async () => {
    const payload = {
      ...validClaimNotificationPayload,
      claim_report_date: new Date("2020-09-15T13:55:22Z"),
      loss_date: new Date("2020-09-15T13:55:22Z"),
    };
    const xml = buildClaimNotificationXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimNotificationRefReq.ClaimNotificationDtl;
    expect(dtl.ClaimReportDate).toBeDefined();
    expect(dtl.LossDate).toBeDefined();
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildClaimNotificationXml(
      validClaimNotificationPayload,
      mockTiraConfig,
    );
    expect(xml).not.toMatch(/^<\?xml/);
  });
});
