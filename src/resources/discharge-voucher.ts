import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  DischargeVoucherPayload,
  DischargeVoucherResponse,
} from "../types/discharge-voucher.js";
import type {
  CallbackResult,
  DischargeVoucherCallbackResponse,
} from "../types/callback.js";
import { validateDischargeVoucherPayload } from "../validation/discharge-voucher.js";
import { buildDischargeVoucherXml } from "../builders/discharge-voucher.js";
import {
  parseCallbackXml,
  verifyCallbackSignature,
} from "../callbacks/handler.js";
import { extractCallbackData } from "../callbacks/registry.js";
import { ENDPOINTS } from "../endpoints.js";

export class DischargeVoucherResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async submit(
    payload: DischargeVoucherPayload,
  ): Promise<DischargeVoucherResponse> {
    validateDischargeVoucherPayload(payload);

    const xml = buildDischargeVoucherXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.discharge_voucher,
      xml,
    );

    const ack = raw?.["TiraMsg"]?.["DischargeVoucherReqAck"];
    return {
      acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
      request_id: ack?.["RequestId"] ?? "",
      tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
      tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
      requires_acknowledgement: true,
      acknowledgement_payload: {
        DischargeVoucherReqAck: ack,
      },
    };
  }

  async handleCallback(
    input: string | Record<string, any>,
  ): Promise<CallbackResult<DischargeVoucherCallbackResponse>> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.verify_signatures !== false,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseData } = await parseCallbackXml(input);
    const extracted = extractCallbackData(
      "discharge_voucher",
      responseData,
    ) as DischargeVoucherCallbackResponse;

    return {
      type: "discharge_voucher",
      body,
      extracted,
      raw_xml: typeof input === "string" ? input : "",
      signature_verified,
    };
  }
}
