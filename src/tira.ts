import type { TiraConfig } from "./types/config.js";
import type { CallbackResult } from "./types/callback.js";
import { TiraClient } from "./client.js";
import { MotorResource } from "./resources/motor.js";
import { parseCallbackXml } from "./callbacks/handler.js";
import { resolveCallbackType, extractCallbackData } from "./callbacks/registry.js";
import { buildAckPayload, buildAcknowledgementXml } from "./builders/acknowledgement.js";
import { signContent, wrapTiraMsg } from "./signing.js";

export class Tira {
  private client: TiraClient;
  private config: TiraConfig;
  public readonly motor: MotorResource;

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
  }

  async handleCallback(input: string | Record<string, any>): Promise<CallbackResult> {
    const { body, responseTag, responseData } = await parseCallbackXml(input);
    const type = resolveCallbackType(responseTag);

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
    return { type, body, extracted, raw_xml: typeof input === "string" ? input : "" };
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
