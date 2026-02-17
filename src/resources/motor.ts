import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  MotorCoverNotePayload,
  MotorCoverNoteResponse,
  MotorVerificationPayload,
  MotorVerificationResponse,
} from "../types/motor.js";
import type { CallbackResult, MotorCallbackResponse } from "../types/callback.js";
import { validateMotorCoverNotePayload, validateMotorVerificationPayload } from "../validation/motor.js";
import { buildMotorCoverNoteXml, buildMotorVerificationXml } from "../builders/motor.js";
import { parseCallbackXml } from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class MotorResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: MotorCoverNotePayload,
  ): Promise<MotorCoverNoteResponse> {
    validateMotorCoverNotePayload(payload);

    const xml = buildMotorCoverNoteXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.covernote_motor,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["MotorCoverNoteRefReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        MotorCoverNoteRefReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<MotorCallbackResponse>> {
    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData("motor", responseData) as MotorCallbackResponse;

    return { type: "motor", body, extracted, raw_xml: typeof input === "string" ? input : "" };
  }

  async verify(
    payload: MotorVerificationPayload,
  ): Promise<MotorVerificationResponse> {
    validateMotorVerificationPayload(payload);

    const xml = buildMotorVerificationXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.motor_verification,
      xml,
    );

    const res = raw?.["TiraMsg"]?.["MotorVerificationRes"];
    const hdr = res?.["VerificationHdr"];
    const result: MotorVerificationResponse = {
      response_id: hdr?.["ResponseId"] ?? "",
      request_id: hdr?.["RequestId"] ?? "",
      tira_status_code: hdr?.["ResponseStatusCode"] ?? "",
      tira_status_desc: hdr?.["ResponseStatusDesc"] ?? "",
    };

    if (result.tira_status_code === "TIRA001") {
      result.data = res?.["VerificationDtl"];
    }

    return result;
  }
}
