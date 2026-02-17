import { describe, it, expect } from "vitest";
import { parseCallbackXml } from "../callbacks/handler.js";
import {
  sampleMotorCallbackXml,
  sampleMotorCallbackParsed,
} from "./fixtures.js";

describe("parseCallbackXml", () => {
  it("parses raw XML string into body, responseTag, responseData", async () => {
    const result = await parseCallbackXml(sampleMotorCallbackXml);
    expect(result.responseTag).toBe("MotorCoverNoteRefRes");
    expect(result.responseData).toBeDefined();
    expect(result.responseData.ResponseId).toBe("RES-001");
    expect(result.body.TiraMsg).toBeDefined();
  });

  it("parses pre-parsed JS object (Express XML middleware)", async () => {
    const result = await parseCallbackXml(sampleMotorCallbackParsed);
    expect(result.responseTag).toBe("MotorCoverNoteRefRes");
    expect(result.responseData.ResponseId).toBe("RES-001");
    expect(result.responseData.StickerNumber).toBe("STK-2025-001");
  });

  it("responseTag excludes MsgSignature", async () => {
    const result = await parseCallbackXml(sampleMotorCallbackParsed);
    expect(result.responseTag).not.toBe("MsgSignature");
  });

  it("responseData contains the actual response fields", async () => {
    const result = await parseCallbackXml(sampleMotorCallbackParsed);
    expect(result.responseData).toHaveProperty("ResponseId");
    expect(result.responseData).toHaveProperty("RequestId");
    expect(result.responseData).toHaveProperty("CoverNoteReferenceNumber");
    expect(result.responseData).toHaveProperty("ResponseStatusCode");
  });

  it("throws on input without TiraMsg", async () => {
    await expect(parseCallbackXml({ SomeOtherTag: {} })).rejects.toThrow(
      "Missing TiraMsg",
    );
  });

  it("throws on invalid XML string", async () => {
    await expect(parseCallbackXml("this is not xml")).rejects.toThrow();
  });

  it("handles TiraMsg with only MsgSignature (no response)", async () => {
    const result = await parseCallbackXml({
      TiraMsg: { MsgSignature: "abc123" },
    });
    expect(result.responseTag).toBe("");
    expect(result.responseData).toEqual({});
  });

  it("throws when pre-parsed object has null TiraMsg", async () => {
    await expect(
      parseCallbackXml({ TiraMsg: null } as any),
    ).rejects.toThrow("Missing TiraMsg");
  });
});
