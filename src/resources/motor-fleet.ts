import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  MotorFleetCoverNotePayload,
  MotorFleetCoverNoteResponse,
} from "../types/motor-fleet.js";
import type {
  CallbackResult,
  MotorFleetCallbackResponse,
} from "../types/callback.js";
import { validateMotorFleetCoverNotePayload } from "../validation/motor-fleet.js";
import { buildMotorFleetCoverNoteXml } from "../builders/motor-fleet.js";
import {
  parseCallbackXml,
  verifyCallbackSignature,
} from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class MotorFleetResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: MotorFleetCoverNotePayload,
  ): Promise<MotorFleetCoverNoteResponse> {
    validateMotorFleetCoverNotePayload(payload);

    const xml = buildMotorFleetCoverNoteXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.covernote_motor_fleet,
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
  ): Promise<CallbackResult<MotorFleetCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.verify_signatures !== false,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData(
      "motor_fleet",
      responseData,
    ) as MotorFleetCallbackResponse;

    return {
      type: "motor_fleet",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
