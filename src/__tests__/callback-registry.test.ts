import { describe, it, expect } from "vitest";
import {
  resolveCallbackType,
  extractCallbackData,
} from "../callbacks/registry.js";

describe("resolveCallbackType", () => {
  it('returns "motor" for MotorCoverNoteRefRes without fleet data', () => {
    const data = { ResponseId: "RES-001", RequestId: "REQ-001" };
    expect(resolveCallbackType("MotorCoverNoteRefRes", data)).toBe("motor");
  });

  it('returns "motor_fleet" for MotorCoverNoteRefRes with FleetResHdr', () => {
    const data = {
      FleetResHdr: { ResponseId: "RES-FLT-001" },
      FleetResDtl: [],
    };
    expect(resolveCallbackType("MotorCoverNoteRefRes", data)).toBe(
      "motor_fleet",
    );
  });

  it('returns "non_life_other" for CoverNoteRefRes', () => {
    const data = { ResponseId: "RES-NLO-001" };
    expect(resolveCallbackType("CoverNoteRefRes", data)).toBe("non_life_other");
  });

  it('returns "unknown" for unrecognized tag', () => {
    expect(resolveCallbackType("SomeFutureTag", {})).toBe("unknown");
  });

  it('returns "unknown" for empty string', () => {
    expect(resolveCallbackType("", {})).toBe("unknown");
  });
});

describe("extractCallbackData — motor", () => {
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
      covernote_reference_number: "CN-2025-001",
      sticker_number: "STK-2025-001",
      response_status_code: "TIRA001",
      response_status_desc: "Successful",
    });
  });

  it('missing fields default to empty string ""', () => {
    const data = {
      ResponseId: "RES-001",
      RequestId: "REQ-001",
    };

    const result = extractCallbackData("motor", data);
    expect(result).toHaveProperty("covernote_reference_number", "");
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
      covernote_reference_number: "",
      sticker_number: "",
      response_status_code: "",
      response_status_desc: "",
    });
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
      covernote_reference_number: "CN-NLO-2025-001",
      response_status_code: "TIRA001",
      response_status_desc: "Successful",
    });
    expect(result).not.toHaveProperty("sticker_number");
  });

  it('missing fields default to empty string "" for non_life_other', () => {
    const data = {
      ResponseId: "RES-NLO-002",
      RequestId: "REQ-NLO-002",
    };

    const result = extractCallbackData("non_life_other", data);
    expect(result).toHaveProperty("covernote_reference_number", "");
    expect(result).toHaveProperty("response_status_code", "");
    expect(result).toHaveProperty("response_status_desc", "");
    expect(result).not.toHaveProperty("sticker_number");
  });

  it("all five non_life_other fields are present even when data is empty object", () => {
    const result = extractCallbackData("non_life_other", {});
    expect(result).toEqual({
      response_id: "",
      request_id: "",
      covernote_reference_number: "",
      response_status_code: "",
      response_status_desc: "",
    });
    expect(result).not.toHaveProperty("sticker_number");
  });
});

describe("extractCallbackData — motor_fleet", () => {
  it("extracts fleet header and multiple vehicle details", () => {
    const data = {
      FleetResHdr: {
        ResponseId: "RES-FLT-001",
        RequestId: "REQ-FLT-001",
        FleetId: "FLT-001",
        FleetStatusCode: "TIRA001",
        FleetStatusDesc: "All vehicles processed",
      },
      FleetResDtl: [
        {
          FleetEntry: "1",
          CoverNoteNumber: "CN-001",
          CoverNoteReferenceNumber: "REF-001",
          StickerNumber: "STK-001",
          ResponseStatusCode: "TIRA001",
          ResponseStatusDesc: "OK",
        },
        {
          FleetEntry: "2",
          CoverNoteNumber: "CN-002",
          CoverNoteReferenceNumber: "REF-002",
          StickerNumber: "STK-002",
          ResponseStatusCode: "TIRA001",
          ResponseStatusDesc: "OK",
        },
      ],
    };

    const result = extractCallbackData("motor_fleet", data);
    expect(result).toEqual({
      response_id: "RES-FLT-001",
      request_id: "REQ-FLT-001",
      fleet_id: "FLT-001",
      fleet_status_code: "TIRA001",
      fleet_status_desc: "All vehicles processed",
      fleet_details: [
        {
          fleet_entry: 1,
          covernote_number: "CN-001",
          covernote_reference_number: "REF-001",
          sticker_number: "STK-001",
          response_status_code: "TIRA001",
          response_status_desc: "OK",
        },
        {
          fleet_entry: 2,
          covernote_number: "CN-002",
          covernote_reference_number: "REF-002",
          sticker_number: "STK-002",
          response_status_code: "TIRA001",
          response_status_desc: "OK",
        },
      ],
    });
  });

  it("handles single FleetResDtl as object (xml2js behavior)", () => {
    const data = {
      FleetResHdr: {
        ResponseId: "RES-FLT-002",
        RequestId: "REQ-FLT-002",
        FleetId: "FLT-002",
        FleetStatusCode: "TIRA001",
        FleetStatusDesc: "OK",
      },
      FleetResDtl: {
        FleetEntry: "1",
        CoverNoteNumber: "CN-001",
        CoverNoteReferenceNumber: "REF-001",
        StickerNumber: "STK-001",
        ResponseStatusCode: "TIRA001",
        ResponseStatusDesc: "OK",
      },
    };

    const result = extractCallbackData("motor_fleet", data) as any;
    expect(result.fleet_details).toHaveLength(1);
    expect(result.fleet_details[0].fleet_entry).toBe(1);
  });

  it("returns empty fleet_details when FleetResDtl is missing", () => {
    const data = {
      FleetResHdr: {
        ResponseId: "RES-FLT-003",
        RequestId: "REQ-FLT-003",
        FleetId: "FLT-003",
        FleetStatusCode: "TIRA020",
        FleetStatusDesc: "Fleet rejected",
      },
    };

    const result = extractCallbackData("motor_fleet", data) as any;
    expect(result.fleet_details).toEqual([]);
    expect(result.fleet_status_code).toBe("TIRA020");
  });

  it("defaults header fields to empty string when FleetResHdr is empty", () => {
    const result = extractCallbackData("motor_fleet", {}) as any;
    expect(result.response_id).toBe("");
    expect(result.request_id).toBe("");
    expect(result.fleet_id).toBe("");
    expect(result.fleet_status_code).toBe("");
    expect(result.fleet_status_desc).toBe("");
    expect(result.fleet_details).toEqual([]);
  });
});

describe("resolveCallbackType — reinsurance", () => {
  it('returns "reinsurance" for ReinsuranceRes tag', () => {
    const data = { ResponseId: "TIRA22424232355", RequestId: "NIC22424232355" };
    expect(resolveCallbackType("ReinsuranceRes", data)).toBe("reinsurance");
  });
});

describe("extractCallbackData — reinsurance", () => {
  it("extracts all 4 reinsurance callback fields correctly", () => {
    const data = {
      ResponseId: "TIRA22424232355",
      RequestId: "NIC22424232355",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    };

    const result = extractCallbackData("reinsurance", data);
    expect(result).toEqual({
      response_id: "TIRA22424232355",
      request_id: "NIC22424232355",
      response_status_code: "TIRA001",
      response_status_desc: "Successful",
    });
  });

  it("does not include covernote_reference_number or sticker_number", () => {
    const data = {
      ResponseId: "RES-001",
      RequestId: "REQ-001",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "OK",
    };

    const result = extractCallbackData("reinsurance", data);
    expect(result).not.toHaveProperty("covernote_reference_number");
    expect(result).not.toHaveProperty("sticker_number");
  });

  it('missing fields default to empty string ""', () => {
    const result = extractCallbackData("reinsurance", {});
    expect(result).toEqual({
      response_id: "",
      request_id: "",
      response_status_code: "",
      response_status_desc: "",
    });
  });
});
