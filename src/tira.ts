import type { TiraConfig } from "./types/config.js";
import type { CallbackResult } from "./types/callback.js";
import { TiraClient } from "./client.js";
import { MotorResource } from "./resources/motor.js";
import { MotorFleetResource } from "./resources/motor-fleet.js";
import { NonLifeOtherResource } from "./resources/non-life-other.js";
import { ReinsuranceResource } from "./resources/reinsurance.js";
import { PolicyResource } from "./resources/policy.js";
import { ClaimNotificationResource } from "./resources/claim-notification.js";
import { CoverNoteVerificationResource } from "./resources/covernote-verification.js";
import { ClaimIntimationResource } from "./resources/claim-intimation.js";
import { ClaimAssessmentResource } from "./resources/claim-assessment.js";
import { DischargeVoucherResource } from "./resources/discharge-voucher.js";
import { ClaimPaymentResource } from "./resources/claim-payment.js";
import { parseCallbackXml, verifyCallbackSignature } from "./callbacks/handler.js";
import { resolveCallbackType, extractCallbackData } from "./callbacks/registry.js";
import { buildAckPayload, buildAcknowledgementXml } from "./builders/acknowledgement.js";
import { signContent, wrapTiraMsg } from "./signing.js";

export class Tira {
  private client: TiraClient;
  private config: TiraConfig;
  public readonly motor: MotorResource;
  public readonly motorFleet: MotorFleetResource;
  public readonly nonLifeOther: NonLifeOtherResource;
  public readonly reinsurance: ReinsuranceResource;
  public readonly policy: PolicyResource;
  public readonly claimNotification: ClaimNotificationResource;
  public readonly coverNoteVerification: CoverNoteVerificationResource;
  public readonly claimIntimation: ClaimIntimationResource;
  public readonly claimAssessment: ClaimAssessmentResource;
  public readonly dischargeVoucher: DischargeVoucherResource;
  public readonly claimPayment: ClaimPaymentResource;

  constructor(config: TiraConfig) {
    if (!config.client_code) {
      throw new Error("Tira: client_code is required");
    }
    if (!config.client_key) {
      throw new Error("Tira: client_key is required");
    }
    if (!config.system_code) {
      throw new Error("Tira: system_code is required");
    }
    if (!config.transacting_company_code) {
      throw new Error("Tira: transacting_company_code is required");
    }
    if (!config.base_url) {
      throw new Error("Tira: base_url is required");
    }
    if (!config.client_cert_path) {
      throw new Error("Tira: client_cert_path is required");
    }
    if (!config.client_key_path) {
      throw new Error("Tira: client_key_path is required");
    }
    if (!config.ca_cert_path) {
      throw new Error("Tira: ca_cert_path is required");
    }
    if (!config.pfx_path) {
      throw new Error("Tira: pfx_path is required");
    }
    if (!config.pfx_passphrase) {
      throw new Error("Tira: pfx_passphrase is required");
    }

    this.config = config;
    this.client = new TiraClient(config);
    this.motor = new MotorResource(this.client, config);
    this.motorFleet = new MotorFleetResource(this.client, config);
    this.nonLifeOther = new NonLifeOtherResource(this.client, config);
    this.reinsurance = new ReinsuranceResource(this.client, config);
    this.policy = new PolicyResource(this.client, config);
    this.claimNotification = new ClaimNotificationResource(this.client, config);
    this.coverNoteVerification = new CoverNoteVerificationResource(this.client, config);
    this.claimIntimation = new ClaimIntimationResource(this.client, config);
    this.claimAssessment = new ClaimAssessmentResource(this.client, config);
    this.dischargeVoucher = new DischargeVoucherResource(this.client, config);
    this.claimPayment = new ClaimPaymentResource(this.client, config);
  }

  async handleCallback(input: string | Record<string, any>): Promise<CallbackResult> {
    const signature_verified = verifyCallbackSignature(
      input,
      this.config.tira_public_pfx_path,
      this.config.tira_public_pfx_passphrase,
    );

    const { body, responseTag, responseData } = await parseCallbackXml(input);
    const type = resolveCallbackType(responseTag, responseData);

    const enabledCallbacks = this.config.enabled_callbacks;
    const isEnabled = enabledCallbacks?.[type as keyof typeof enabledCallbacks];

    if (type === "unknown") {
      throw new Error(
        `Unknown callback type: unrecognized response tag '${responseTag}'.`,
      );
    }

    if (!isEnabled) {
      throw new Error(
        `Callback type '${type}' is not enabled. Add { enabled_callbacks: { ${type}: true } } to your Tira config.`,
      );
    }

    const extracted = extractCallbackData(type, responseData);
    return { type, body, extracted, raw_xml: typeof input === "string" ? input : "", signature_verified };
  }

  acknowledge(parsedBody: Record<string, any>, acknowledgementId: string): string {
    const ackPayload = buildAckPayload(parsedBody, acknowledgementId);
    const ackContentXml = buildAcknowledgementXml(ackPayload);
    const signature = signContent(
      ackContentXml,
      this.config.pfx_path,
      this.config.pfx_passphrase,
    );
    return wrapTiraMsg(ackContentXml, signature);
  }
}
