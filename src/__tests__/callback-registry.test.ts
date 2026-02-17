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

describe("resolveCallbackType — non_life_other", () => {
  it('returns "non_life_other" for CoverNoteRefRes', () => {
    expect(resolveCallbackType("CoverNoteRefRes")).toBe("non_life_other");
  });
});

describe("extractCallbackData — non_life_other", () => {
  it("extracts all 5 non_life_other callback fields correctly (no sticker_number)", () => {
    const data = {
      ResponseId: "RES-NLO-001",
      RequestId: "REQ-NLO-001",
      CoverNoteReferenceNumber: "CN-NLO-2025-001",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    };

    const result = extractCallbackData("non_life_other", data);
    expect(result).toEqual({
      response_id: "RES-NLO-001",
      request_id: "REQ-NLO-001",
      cover_note_reference_number: "CN-NLO-2025-001",
      response_status_code: "TIRA001",
      response_status_desc: "Successful",
    });
    expect(result).not.toHaveProperty("sticker_number");
  });

  it('missing fields default to empty string "" for non_life_other', () => {
    const data = {
      ResponseId: "RES-NLO-002",
      RequestId: "REQ-NLO-002",
      // CoverNoteReferenceNumber missing
    };

    const result = extractCallbackData("non_life_other", data);
    expect(result).toHaveProperty("cover_note_reference_number", "");
    expect(result).toHaveProperty("response_status_code", "");
    expect(result).toHaveProperty("response_status_desc", "");
    expect(result).not.toHaveProperty("sticker_number");
  });

  it("all five non_life_other fields are present even when data is empty object", () => {
    const result = extractCallbackData("non_life_other", {});
    expect(result).toEqual({
      response_id: "",
      request_id: "",
      cover_note_reference_number: "",
      response_status_code: "",
      response_status_desc: "",
    });
    expect(result).not.toHaveProperty("sticker_number");
  });
});
