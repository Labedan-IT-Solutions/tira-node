import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildCoverNoteVerificationXml } from "../builders/covernote-verification.js";
import {
  validCoverNoteVerificationPayload,
  validCoverNoteVerificationPayloadFull,
  mockTiraConfig,
} from "./fixtures.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildCoverNoteVerificationXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildCoverNoteVerificationXml(
      validCoverNoteVerificationPayload,
      mockTiraConfig,
    );
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is CoverNoteVerificationReq", async () => {
    const xml = buildCoverNoteVerificationXml(
      validCoverNoteVerificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("CoverNoteVerificationReq");
  });

  it("VerificationHdr contains config fields", async () => {
    const xml = buildCoverNoteVerificationXml(
      validCoverNoteVerificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.CoverNoteVerificationReq.VerificationHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
    expect(hdr.RequestId).toBe(
      validCoverNoteVerificationPayload.request_id,
    );
  });

  it("VerificationDtl contains cover note reference number", async () => {
    const xml = buildCoverNoteVerificationXml(
      validCoverNoteVerificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.CoverNoteVerificationReq.VerificationDtl;
    expect(dtl.CoverNoteReferenceNumber).toBe("4242424");
  });

  it("optional fields default to empty string when not provided", async () => {
    const xml = buildCoverNoteVerificationXml(
      validCoverNoteVerificationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.CoverNoteVerificationReq.VerificationDtl;
    expect(dtl.StickerNumber).toBe("");
    expect(dtl.MotorRegistrationNumber).toBe("");
    expect(dtl.MotorChassisNumber).toBe("");
  });

  it("optional fields are set when provided", async () => {
    const xml = buildCoverNoteVerificationXml(
      validCoverNoteVerificationPayloadFull,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.CoverNoteVerificationReq.VerificationDtl;
    expect(dtl.StickerNumber).toBe("1313-1414-124124");
    expect(dtl.MotorRegistrationNumber).toBe("T233SQA");
    expect(dtl.MotorChassisNumber).toBe("4353646");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildCoverNoteVerificationXml(
      validCoverNoteVerificationPayload,
      mockTiraConfig,
    );
    expect(xml).not.toMatch(/^<\?xml/);
  });
});
