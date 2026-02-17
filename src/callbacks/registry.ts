import type { MotorCallbackResponse, NonLifeOtherCallbackResponse } from "../types/callback.js";

const TAG_MAP: Record<string, string> = {
  MotorCoverNoteRefRes: "motor",
  CoverNoteRefRes: "non_life_other",
};

const EXTRACTORS: Record<string, (data: Record<string, any>) => Record<string, any>> = {
  motor: extractMotorCallback,
  non_life_other: extractNonLifeOtherCallback,
};

function extractMotorCallback(data: Record<string, any>): MotorCallbackResponse {
  return {
    response_id: data.ResponseId ?? "",
    request_id: data.RequestId ?? "",
    cover_note_reference_number: data.CoverNoteReferenceNumber ?? "",
    sticker_number: data.StickerNumber ?? "",
    response_status_code: data.ResponseStatusCode ?? "",
    response_status_desc: data.ResponseStatusDesc ?? "",
  };
}

function extractNonLifeOtherCallback(data: Record<string, any>): NonLifeOtherCallbackResponse {
  return {
    response_id: data.ResponseId ?? "",
    request_id: data.RequestId ?? "",
    cover_note_reference_number: data.CoverNoteReferenceNumber ?? "",
    response_status_code: data.ResponseStatusCode ?? "",
    response_status_desc: data.ResponseStatusDesc ?? "",
  };
}

export function resolveCallbackType(responseTag: string): string {
  return TAG_MAP[responseTag] ?? "unknown";
}

export function extractCallbackData(type: string, data: Record<string, any>): Record<string, any> {
  const extractor = EXTRACTORS[type];
  if (!extractor) return data;
  return extractor(data);
}
