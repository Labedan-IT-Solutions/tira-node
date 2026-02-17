import type {
  MotorCallbackResponse,
  MotorFleetCallbackResponse,
  NonLifeOtherCallbackResponse,
  ReinsuranceCallbackResponse,
  PolicyCallbackResponse,
  ClaimNotificationCallbackResponse,
} from "../types/callback.js";

const TAG_MAP: Record<string, string> = {
  MotorCoverNoteRefRes: "motor",
  CoverNoteRefRes: "non_life_other",
  ReinsuranceRes: "reinsurance",
  PolicyRes: "policy",
  ClaimNotificationRefRes: "claim_notification",
};

/**
 * Discriminators refine the callback type when multiple sub-types share the same response tag.
 * Each function inspects the response data and returns a refined type string, or undefined to
 * fall through to the default TAG_MAP type. This pattern is reusable for any future tag that
 * has multiple sub-types.
 */
const TAG_DISCRIMINATORS: Record<
  string,
  (data: Record<string, any>) => string | undefined
> = {
  MotorCoverNoteRefRes: (data) => {
    if (data.FleetResHdr) return "motor_fleet";
    return undefined;
  },
};

const EXTRACTORS: Record<
  string,
  (data: Record<string, any>) => Record<string, any>
> = {
  motor: extractMotorCallback,
  motor_fleet: extractMotorFleetCallback,
  non_life_other: extractNonLifeOtherCallback,
  reinsurance: extractReinsuranceCallback,
  policy: extractPolicyCallback,
  claim_notification: extractClaimNotificationCallback,
};

function extractMotorCallback(
  data: Record<string, any>,
): MotorCallbackResponse {
  return {
    response_id: data.ResponseId ?? "",
    request_id: data.RequestId ?? "",
    covernote_reference_number: data.CoverNoteReferenceNumber ?? "",
    sticker_number: data.StickerNumber ?? "",
    response_status_code: data.ResponseStatusCode ?? "",
    response_status_desc: data.ResponseStatusDesc ?? "",
  };
}

function extractMotorFleetCallback(
  data: Record<string, any>,
): MotorFleetCallbackResponse {
  const hdr = data.FleetResHdr ?? {};
  const dtlRaw = data.FleetResDtl;
  // xml2js returns a single object when there's one entry, array when multiple
  const dtls = Array.isArray(dtlRaw) ? dtlRaw : dtlRaw ? [dtlRaw] : [];

  return {
    response_id: hdr.ResponseId ?? "",
    request_id: hdr.RequestId ?? "",
    fleet_id: hdr.FleetId ?? "",
    fleet_status_code: hdr.FleetStatusCode ?? "",
    fleet_status_desc: hdr.FleetStatusDesc ?? "",
    fleet_details: dtls.map((d: Record<string, any>) => ({
      fleet_entry: Number(d.FleetEntry ?? 0),
      covernote_number: d.CoverNoteNumber ?? "",
      covernote_reference_number: d.CoverNoteReferenceNumber ?? "",
      sticker_number: d.StickerNumber ?? "",
      response_status_code: d.ResponseStatusCode ?? "",
      response_status_desc: d.ResponseStatusDesc ?? "",
    })),
  };
}

function extractNonLifeOtherCallback(
  data: Record<string, any>,
): NonLifeOtherCallbackResponse {
  return {
    response_id: data.ResponseId ?? "",
    request_id: data.RequestId ?? "",
    covernote_reference_number: data.CoverNoteReferenceNumber ?? "",
    response_status_code: data.ResponseStatusCode ?? "",
    response_status_desc: data.ResponseStatusDesc ?? "",
  };
}

function extractReinsuranceCallback(
  data: Record<string, any>,
): ReinsuranceCallbackResponse {
  return {
    response_id: data.ResponseId ?? "",
    request_id: data.RequestId ?? "",
    response_status_code: data.ResponseStatusCode ?? "",
    response_status_desc: data.ResponseStatusDesc ?? "",
  };
}

function extractPolicyCallback(
  data: Record<string, any>,
): PolicyCallbackResponse {
  return {
    response_id: data.ResponseId ?? "",
    request_id: data.RequestId ?? "",
    response_status_code: data.ResponseStatusCode ?? "",
    response_status_desc: data.ResponseStatusDesc ?? "",
  };
}

function extractClaimNotificationCallback(
  data: Record<string, any>,
): ClaimNotificationCallbackResponse {
  return {
    response_id: data.ResponseId ?? "",
    request_id: data.RequestId ?? "",
    claim_reference_number: data.ClaimReferenceNumber ?? "",
    response_status_code: data.ResponseStatusCode ?? "",
    response_status_desc: data.ResponseStatusDesc ?? "",
  };
}

export function resolveCallbackType(
  responseTag: string,
  responseData: Record<string, any>,
): string {
  const discriminator = TAG_DISCRIMINATORS[responseTag];
  if (discriminator) {
    const refined = discriminator(responseData);
    if (refined) return refined;
  }
  return TAG_MAP[responseTag] ?? "unknown";
}

export function extractCallbackData(
  type: string,
  data: Record<string, any>,
): Record<string, any> {
  const extractor = EXTRACTORS[type];
  if (!extractor) return data;
  return extractor(data);
}
