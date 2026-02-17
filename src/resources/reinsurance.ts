import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  ReinsurancePayload,
  ReinsuranceResponse,
} from "../types/reinsurance.js";
import type { CallbackResult, ReinsuranceCallbackResponse } from "../types/callback.js";
import { validateReinsurancePayload } from "../validation/reinsurance.js";
import { buildReinsuranceXml } from "../builders/reinsurance.js";
import { parseCallbackXml, verifyCallbackSignature } from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class ReinsuranceResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: ReinsurancePayload,
  ): Promise<ReinsuranceResponse> {
    validateReinsurancePayload(payload);

    const xml = buildReinsuranceXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.reinsurance_submission,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["ReinsuranceReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        ReinsuranceReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<ReinsuranceCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.verify_signatures !== false,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData("reinsurance", responseData) as ReinsuranceCallbackResponse;

    return {
      type: "reinsurance",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
