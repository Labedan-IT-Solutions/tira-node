import { parseStringPromise } from "xml2js";
import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  MotorCoverNotePayload,
  MotorCoverNoteResponse,
  MotorCallbackResult,
  HandleCallbackOptions,
} from "../types/motor.js";
import { validateMotorCoverNotePayload } from "../validation/motor.js";
import { buildMotorCoverNoteXml } from "../builders/motor.js";
import { buildAckPayload, buildAcknowledgementXml } from "../builders/acknowledgement.js";
import { signContent, wrapTiraMsg } from "../signing.js";
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
    rawXml: string,
    options?: HandleCallbackOptions,
  ): Promise<MotorCallbackResult> {
    const body = await parseStringPromise(rawXml, { explicitArray: false });

    const tiraMsg = body?.TiraMsg;
    const responseTag = Object.keys(tiraMsg).find((k) => k !== "MsgSignature");
    const responseData = responseTag ? tiraMsg[responseTag] : undefined;

    const extracted: MotorCoverNoteResponse = {
      acknowledgement_id: responseData?.AcknowledgementId ?? "",
      request_id: responseData?.RequestId ?? "",
      tira_status_code: responseData?.AcknowledgementStatusCode ?? "",
      tira_status_desc: responseData?.AcknowledgementStatusDesc ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: responseTag
        ? { [responseTag]: responseData }
        : {},
    };

    let ack_xml: string | undefined;
    if (options?.acknowledge) {
      const ackPayload = buildAckPayload(body);
      const ackContentXml = buildAcknowledgementXml(ackPayload);
      const signature = signContent(
        ackContentXml,
        this.config.pfx_path,
        this.config.pfx_passphrase,
      );
      ack_xml = wrapTiraMsg(ackContentXml, signature);
    }

    return { body, extracted, raw_xml: rawXml, ack_xml };
  }
}
