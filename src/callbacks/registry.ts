import type {
  BaseCallbackResponse,
  MotorCallbackResponse,
  MotorFleetCallbackResponse,
  NonLifeOtherCallbackResponse,
  ClaimNotificationCallbackResponse,
} from "../types/callback.js";

const TAG_MAP: Record<string, string> = {
  MotorCoverNoteRefRes: "motor",
  CoverNoteRefRes: "non_life_other",
  ReinsuranceRes: "reinsurance",
  PolicyRes: "policy",
  ClaimNotificationRefRes: "claim_notification",
  ClaimIntimationRes: "claim_intimation",
  ClaimAssessmentRes: "claim_assessment",
  DischargeVoucherRes: "discharge_voucher",
  ClaimPaymentRes: "claim_payment",
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
  reinsurance: extractBaseCallback,
  policy: extractBaseCallback,
  claim_notification: extractClaimNotificationCallback,
  claim_intimation: extractBaseCallback,
  claim_assessment: extractBaseCallback,
  discharge_voucher: extractBaseCallback,
  claim_payment: extractBaseCallback,
};

function extractBaseCallback(
  data: Record<string, any>,
): BaseCallbackResponse {
  return {
    response_id: data.ResponseId ?? "",
    request_id: data.RequestId ?? "",
    response_status_code: data.ResponseStatusCode ?? "",
    response_status_desc: data.ResponseStatusDesc ?? "",
  };
}

function extractMotorCallback(
  data: Record<string, any>,
): MotorCallbackResponse {
  return {
    ...extractBaseCallback(data),
    covernote_reference_number: data.CoverNoteReferenceNumber ?? "",
    sticker_number: data.StickerNumber ?? "",
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
    ...extractBaseCallback(data),
    covernote_reference_number: data.CoverNoteReferenceNumber ?? "",
  };
}

function extractClaimNotificationCallback(
  data: Record<string, any>,
): ClaimNotificationCallbackResponse {
  return {
    ...extractBaseCallback(data),
    claim_reference_number: data.ClaimReferenceNumber ?? "",
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
