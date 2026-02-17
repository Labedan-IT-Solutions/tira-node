import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  ClaimRejectionPayload,
  ClaimRejectionResponse,
} from "../types/claim-rejection.js";
import type {
  CallbackResult,
  ClaimRejectionCallbackResponse,
} from "../types/callback.js";
import { validateClaimRejectionPayload } from "../validation/claim-rejection.js";
import { buildClaimRejectionXml } from "../builders/claim-rejection.js";
import {
  parseCallbackXml,
  verifyCallbackSignature,
} from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class ClaimRejectionResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: ClaimRejectionPayload,
  ): Promise<ClaimRejectionResponse> {
    validateClaimRejectionPayload(payload);

    const xml = buildClaimRejectionXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.claim_rejection,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["ClaimRejectionReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        ClaimRejectionReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<ClaimRejectionCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.verify_signatures !== false,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData(
      "claim_rejection",
      responseData,
    ) as ClaimRejectionCallbackResponse;

    return {
      type: "claim_rejection",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
