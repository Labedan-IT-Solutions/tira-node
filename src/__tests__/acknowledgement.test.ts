import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildAckPayload, buildAcknowledgementXml } from "../builders/acknowledgement.js";
import { sampleMotorCallbackParsed } from "./fixtures.js";

describe("buildAckPayload", () => {
  it("creates payload with key = responseTag + 'Ack'", () => {
    const payload = buildAckPayload(sampleMotorCallbackParsed, "ACK-123");
    expect(payload).toHaveProperty("MotorCoverNoteRefResAck");
  });

  it("AcknowledgementId matches the provided ID", () => {
    const payload = buildAckPayload(sampleMotorCallbackParsed, "CUSTOM-ACK-ID") as any;
    expect(payload.MotorCoverNoteRefResAck.AcknowledgementId).toBe("CUSTOM-ACK-ID");
  });

  it("ResponseId is extracted from response data", () => {
    const payload = buildAckPayload(sampleMotorCallbackParsed, "ACK-123") as any;
    expect(payload.MotorCoverNoteRefResAck.ResponseId).toBe("RES-001");
  });

  it("status code is 'TIRA001' and desc is 'Successful'", () => {
    const payload = buildAckPayload(sampleMotorCallbackParsed, "ACK-123") as any;
    expect(payload.MotorCoverNoteRefResAck.AcknowledgementStatusCode).toBe("TIRA001");
    expect(payload.MotorCoverNoteRefResAck.AcknowledgementStatusDesc).toBe("Successful");
  });

  it("throws on missing TiraMsg", () => {
    expect(() => buildAckPayload({ SomeOther: {} }, "ACK-123")).toThrow("Missing TiraMsg");
  });

  it("throws when only MsgSignature is present (no response tag)", () => {
    expect(() =>
      buildAckPayload({ TiraMsg: { MsgSignature: "abc123" } }, "ACK-123"),
    ).toThrow("No response tag");
  });

  it("skips MsgSignature when finding response tag", () => {
    const payload = buildAckPayload(sampleMotorCallbackParsed, "ACK-123");
    // Should not create a "MsgSignatureAck" key
    expect(payload).not.toHaveProperty("MsgSignatureAck");
    expect(payload).toHaveProperty("MotorCoverNoteRefResAck");
  });
});

describe("buildAcknowledgementXml", () => {
  it("produces valid parseable XML", async () => {
    const payload = buildAckPayload(sampleMotorCallbackParsed, "ACK-123");
    const xml = buildAcknowledgementXml(payload);
    const parsed = await parseStringPromise(xml, { explicitArray: false });
    expect(parsed).toBeDefined();
  });

  it("output is headless (no XML declaration)", () => {
    const payload = buildAckPayload(sampleMotorCallbackParsed, "ACK-123");
    const xml = buildAcknowledgementXml(payload);
    expect(xml).not.toMatch(/^<\?xml/);
  });

  it("XML structure matches the ack payload keys", async () => {
    const payload = buildAckPayload(sampleMotorCallbackParsed, "ACK-123");
    const xml = buildAcknowledgementXml(payload);
    const parsed = await parseStringPromise(xml, { explicitArray: false });
    expect(parsed).toHaveProperty("MotorCoverNoteRefResAck");
    expect(parsed.MotorCoverNoteRefResAck.AcknowledgementId).toBe("ACK-123");
  });
});
