import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildPolicyXml } from "../builders/policy.js";
import { validPolicyPayload, validPolicyDetail, mockTiraConfig } from "./fixtures.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildPolicyXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildPolicyXml(validPolicyPayload, mockTiraConfig);
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is PolicyReq", async () => {
    const xml = buildPolicyXml(validPolicyPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("PolicyReq");
  });

  it("PolicyHdr contains config fields", async () => {
    const xml = buildPolicyXml(validPolicyPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.PolicyReq.PolicyHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
  });

  it("PolicyHdr contains payload fields", async () => {
    const xml = buildPolicyXml(validPolicyPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const hdr = parsed.PolicyReq.PolicyHdr;
    expect(hdr.RequestId).toBe(validPolicyPayload.request_id);
    expect(hdr.CallBackUrl).toBe(validPolicyPayload.callback_url);
    expect(hdr.InsurerCompanyCode).toBe(validPolicyPayload.insurer_company_code);
  });

  it("PolicyDtl is a single object (not array)", async () => {
    const xml = buildPolicyXml(validPolicyPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.PolicyReq.PolicyDtl;
    expect(Array.isArray(dtl)).toBe(false);
    expect(dtl).toBeDefined();
  });

  it("PolicyDtl has correct text fields", async () => {
    const xml = buildPolicyXml(validPolicyPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.PolicyReq.PolicyDtl;
    expect(dtl.PolicyNumber).toBe("CV224223255");
    expect(dtl.PolicyOperativeClause).toBe(validPolicyDetail.policy_operative_clause);
    expect(dtl.SpecialConditions).toBe(validPolicyDetail.special_conditions);
    expect(dtl.Exclusions).toBe(validPolicyDetail.exclusions);
  });

  it("Exclusions defaults to empty string when not provided", async () => {
    const payload = {
      ...validPolicyPayload,
      policy_detail: { ...validPolicyDetail, exclusions: undefined },
    };
    const xml = buildPolicyXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.PolicyReq.PolicyDtl;
    expect(dtl.Exclusions).toBe("");
  });

  it("AppliedCoverNotes contains CoverNoteReferenceNumber entries", async () => {
    const xml = buildPolicyXml(validPolicyPayload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.PolicyReq.PolicyDtl;
    const coverNotes = dtl.AppliedCoverNotes.CoverNoteReferenceNumber;
    expect(Array.isArray(coverNotes)).toBe(true);
    expect(coverNotes).toHaveLength(2);
    expect(coverNotes[0]).toBe("4242424");
    expect(coverNotes[1]).toBe("2323235");
  });

  it("single cover note is still accessible", async () => {
    const payload = {
      ...validPolicyPayload,
      policy_detail: { ...validPolicyDetail, applied_cover_notes: ["CN-SINGLE"] },
    };
    const xml = buildPolicyXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.PolicyReq.PolicyDtl;
    // xml2js with explicitArray: false returns a string for single element
    expect(dtl.AppliedCoverNotes.CoverNoteReferenceNumber).toBe("CN-SINGLE");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildPolicyXml(validPolicyPayload, mockTiraConfig);
    expect(xml).not.toMatch(/^<\?xml/);
  });
});
