import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  ClaimNotificationPayload,
  ClaimNotificationResponse,
} from "../types/claim-notification.js";
import type {
  CallbackResult,
  ClaimNotificationCallbackResponse,
} from "../types/callback.js";
import { validateClaimNotificationPayload } from "../validation/claim-notification.js";
import { buildClaimNotificationXml } from "../builders/claim-notification.js";
import {
  parseCallbackXml,
  verifyCallbackSignature,
} from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class ClaimNotificationResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: ClaimNotificationPayload,
  ): Promise<ClaimNotificationResponse> {
    validateClaimNotificationPayload(payload);

    const xml = buildClaimNotificationXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.claim_notification,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["ClaimNotificationRefReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        ClaimNotificationRefReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<ClaimNotificationCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.verify_signatures !== false,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData(
      "claim_notification",
      responseData,
    ) as ClaimNotificationCallbackResponse;

    return {
      type: "claim_notification",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
