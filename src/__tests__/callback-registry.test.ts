import { describe, it, expect } from "vitest";
import { resolveCallbackType, extractCallbackData } from "../callbacks/registry.js";

describe("resolveCallbackType", () => {
  it('returns "motor" for MotorCoverNoteRefRes', () => {
    expect(resolveCallbackType("MotorCoverNoteRefRes")).toBe("motor");
  });

  it('returns "unknown" for unrecognized tag', () => {
    expect(resolveCallbackType("SomeFutureTag")).toBe("unknown");
  });

  it('returns "unknown" for empty string', () => {
    expect(resolveCallbackType("")).toBe("unknown");
  });
});

describe("extractCallbackData", () => {
  it("extracts all motor callback fields correctly", () => {
    const data = {
      ResponseId: "RES-001",
      RequestId: "REQ-001",
      CoverNoteReferenceNumber: "CN-2025-001",
      StickerNumber: "STK-2025-001",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    };

    const result = extractCallbackData("motor", data);
    expect(result).toEqual({
      response_id: "RES-001",
      request_id: "REQ-001",
      cover_note_reference_number: "CN-2025-001",
      sticker_number: "STK-2025-001",
      response_status_code: "TIRA001",
      response_status_desc: "Successful",
    });
  });

  it('missing fields default to empty string ""', () => {
    const data = {
      ResponseId: "RES-001",
      RequestId: "REQ-001",
      // CoverNoteReferenceNumber, StickerNumber are missing — TIRA error responses omit these
    };

    const result = extractCallbackData("motor", data);
    expect(result).toHaveProperty("cover_note_reference_number", "");
    expect(result).toHaveProperty("sticker_number", "");
  });

  it("returns raw data for unknown type (no extractor)", () => {
    const data = { SomeField: "value" };
    const result = extractCallbackData("unknown_type", data);
    expect(result).toBe(data);
  });

  it("all six motor fields are present even when data is empty object", () => {
    const result = extractCallbackData("motor", {});
    expect(result).toEqual({
      response_id: "",
      request_id: "",
      cover_note_reference_number: "",
      sticker_number: "",
      response_status_code: "",
      response_status_desc: "",
    });
  });
});
