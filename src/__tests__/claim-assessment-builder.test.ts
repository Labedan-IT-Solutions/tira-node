import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildClaimAssessmentXml } from "../builders/claim-assessment.js";
import { validClaimAssessmentPayload, mockTiraConfig } from "./fixtures.js";
import { formatDateForTira } from "../utils.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildClaimAssessmentXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is ClaimAssessmentReq", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("ClaimAssessmentReq");
  });

  it("ClaimAssessmentHdr contains config fields", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimAssessmentReq.ClaimAssessmentHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
  });

  it("ClaimAssessmentHdr contains payload fields", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimAssessmentReq.ClaimAssessmentHdr;
    expect(hdr.RequestId).toBe(validClaimAssessmentPayload.request_id);
    expect(hdr.CallBackUrl).toBe(validClaimAssessmentPayload.callback_url);
    expect(hdr.InsurerCompanyCode).toBe(
      validClaimAssessmentPayload.insurer_company_code,
    );
  });

  it("ClaimAssessmentDtl has all mandatory text fields", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimAssessmentReq.ClaimAssessmentDtl;
    expect(dtl.ClaimAssessmentNumber).toBe("322WQ25234234");
    expect(dtl.ClaimIntimationNumber).toBe("35234234");
    expect(dtl.ClaimReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.CoverNoteReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.AssessmentReportSummary).toBe("rgegerufuiwiuefuiqwguqufi");
    expect(dtl.ClaimApprovalAuthority).toBe("CEO");
    expect(dtl.IsReAssessment).toBe("Y");
  });

  it("numeric fields are formatted to 2 decimal places", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimAssessmentReq.ClaimAssessmentDtl;
    expect(dtl.ExchangeRate).toBe("2000.00");
    expect(dtl.AssessmentAmount).toBe("20000.00");
    expect(dtl.ApprovedClaimAmount).toBe("20000.00");
  });

  it("assessment_received_date is formatted via formatDateForTira", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimAssessmentReq.ClaimAssessmentDtl;
    const expected = formatDateForTira(
      validClaimAssessmentPayload.assessment_received_date,
    );
    expect(dtl.AssessmentReceivedDate).toBe(expected);
  });

  it("claim_approval_date is formatted via formatDateForTira", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimAssessmentReq.ClaimAssessmentDtl;
    const expected = formatDateForTira(
      validClaimAssessmentPayload.claim_approval_date,
    );
    expect(dtl.ClaimApprovalDate).toBe(expected);
  });

  it("currency_code defaults to TZS when not provided", async () => {
    const payload = { ...validClaimAssessmentPayload, currency_code: undefined };
    const xml = buildClaimAssessmentXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimAssessmentReq.ClaimAssessmentDtl;
    expect(dtl.CurrencyCode).toBe("TZS");
  });

  it("exchange_rate defaults to 1.00 when not provided", async () => {
    const payload = { ...validClaimAssessmentPayload, exchange_rate: undefined };
    const xml = buildClaimAssessmentXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimAssessmentReq.ClaimAssessmentDtl;
    expect(dtl.ExchangeRate).toBe("1.00");
  });

  it("renders Claimants with multiple Claimant entries", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const claimants =
      parsed.ClaimAssessmentReq.ClaimAssessmentDtl.Claimants.Claimant;
    expect(Array.isArray(claimants)).toBe(true);
    expect(claimants).toHaveLength(2);
    expect(claimants[0].ClaimantIdNumber).toBe("24241241");
    expect(claimants[1].ClaimantIdNumber).toBe("3452525235525");
  });

  it("claimant fields are mapped correctly", async () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const c =
      parsed.ClaimAssessmentReq.ClaimAssessmentDtl.Claimants.Claimant[0];
    expect(c.ClaimantCategory).toBe("2");
    expect(c.ClaimantType).toBe("1");
    expect(c.ClaimantIdNumber).toBe("24241241");
    expect(c.ClaimantIdType).toBe("1");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildClaimAssessmentXml(
      validClaimAssessmentPayload,
      mockTiraConfig,
    );
    expect(xml).not.toMatch(/^<\?xml/);
  });
});
