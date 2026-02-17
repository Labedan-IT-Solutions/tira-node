import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  ClaimIntimationPayload,
  ClaimIntimationResponse,
} from "../types/claim-intimation.js";
import type {
  CallbackResult,
  ClaimIntimationCallbackResponse,
} from "../types/callback.js";
import { validateClaimIntimationPayload } from "../validation/claim-intimation.js";
import { buildClaimIntimationXml } from "../builders/claim-intimation.js";
import {
  parseCallbackXml,
  verifyCallbackSignature,
} from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class ClaimIntimationResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: ClaimIntimationPayload,
  ): Promise<ClaimIntimationResponse> {
    validateClaimIntimationPayload(payload);

    const xml = buildClaimIntimationXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.claim_intimation,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["ClaimIntimationReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        ClaimIntimationReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<ClaimIntimationCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData(
      "claim_intimation",
      responseData,
    ) as ClaimIntimationCallbackResponse;

    return {
      type: "claim_intimation",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
