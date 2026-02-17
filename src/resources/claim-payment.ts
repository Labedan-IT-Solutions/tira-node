import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  ClaimPaymentPayload,
  ClaimPaymentResponse,
} from "../types/claim-payment.js";
import type {
  CallbackResult,
  ClaimPaymentCallbackResponse,
} from "../types/callback.js";
import { validateClaimPaymentPayload } from "../validation/claim-payment.js";
import { buildClaimPaymentXml } from "../builders/claim-payment.js";
import {
  parseCallbackXml,
  verifyCallbackSignature,
} from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class ClaimPaymentResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: ClaimPaymentPayload,
  ): Promise<ClaimPaymentResponse> {
    validateClaimPaymentPayload(payload);

    const xml = buildClaimPaymentXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.claim_payment,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["ClaimPaymentReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        ClaimPaymentReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<ClaimPaymentCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.verify_signatures !== false,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData(
      "claim_payment",
      responseData,
    ) as ClaimPaymentCallbackResponse;

    return {
      type: "claim_payment",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
