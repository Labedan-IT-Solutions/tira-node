import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type { PolicyPayload, PolicyResponse } from "../types/policy.js";
import type {
  CallbackResult,
  PolicyCallbackResponse,
} from "../types/callback.js";
import { validatePolicyPayload } from "../validation/policy.js";
import { buildPolicyXml } from "../builders/policy.js";
import {
  parseCallbackXml,
  verifyCallbackSignature,
} from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class PolicyResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(payload: PolicyPayload): Promise<PolicyResponse> {
    validatePolicyPayload(payload);

    const xml = buildPolicyXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.policy_submission,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["PolicyReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        PolicyReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<PolicyCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.verify_signatures !== false,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData(
      "policy",
      responseData,
    ) as PolicyCallbackResponse;

    return {
      type: "policy",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
