import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  MotorCoverNotePayload,
  MotorCoverNoteResponse,
} from "../types/motor.js";
import { validateMotorCoverNotePayload } from "../validation/motor.js";
import { buildMotorCoverNoteXml } from "../builders/motor.js";
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
}
