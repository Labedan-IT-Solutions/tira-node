import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  ClaimAssessmentPayload,
  ClaimAssessmentResponse,
} from "../types/claim-assessment.js";
import type {
  CallbackResult,
  ClaimAssessmentCallbackResponse,
} from "../types/callback.js";
import { validateClaimAssessmentPayload } from "../validation/claim-assessment.js";
import { buildClaimAssessmentXml } from "../builders/claim-assessment.js";
import {
  parseCallbackXml,
  verifyCallbackSignature,
} from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class ClaimAssessmentResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: ClaimAssessmentPayload,
  ): Promise<ClaimAssessmentResponse> {
    validateClaimAssessmentPayload(payload);

    const xml = buildClaimAssessmentXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.claim_assessment,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["ClaimAssessmentReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        ClaimAssessmentReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<ClaimAssessmentCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.verify_signatures !== false,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData(
      "claim_assessment",
      responseData,
    ) as ClaimAssessmentCallbackResponse;

    return {
      type: "claim_assessment",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
