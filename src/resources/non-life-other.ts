import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  NonLifeOtherCoverNotePayload,
  NonLifeOtherCoverNoteResponse,
} from "../types/non-life-other.js";
import type { CallbackResult, NonLifeOtherCallbackResponse } from "../types/callback.js";
import { validateNonLifeOtherCoverNotePayload } from "../validation/non-life-other.js";
import { buildNonLifeOtherCoverNoteXml } from "../builders/non-life-other.js";
import { parseCallbackXml, verifyCallbackSignature } from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class NonLifeOtherResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: NonLifeOtherCoverNotePayload,
  ): Promise<NonLifeOtherCoverNoteResponse> {
    validateNonLifeOtherCoverNotePayload(payload);

    const xml = buildNonLifeOtherCoverNoteXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.covernote_other,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["CoverNoteRefReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        CoverNoteRefReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<NonLifeOtherCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData("non_life_other", responseData) as NonLifeOtherCallbackResponse;

    return { type: "non_life_other", body, extracted, raw_xml: typeof input === "string" ? input : "", signature_verified };
  }
}
