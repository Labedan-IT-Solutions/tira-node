import type { TiraClient } from "../client.js";
import type { TiraConfig } from "../types/config.js";
import type {
  CoverNoteVerificationPayload,
  CoverNoteVerificationResponse,
} from "../types/covernote-verification.js";
import { validateCoverNoteVerificationPayload } from "../validation/covernote-verification.js";
import { buildCoverNoteVerificationXml } from "../builders/covernote-verification.js";
import { ENDPOINTS } from "../endpoints.js";

export class CoverNoteVerificationResource {
  private client: TiraClient;
  private config: TiraConfig;

  constructor(client: TiraClient, config: TiraConfig) {
    this.client = client;
    this.config = config;
  }

  async verify(
    payload: CoverNoteVerificationPayload,
  ): Promise<CoverNoteVerificationResponse> {
    validateCoverNoteVerificationPayload(payload);

    const xml = buildCoverNoteVerificationXml(payload, this.config);
    const raw = await this.client.postXml<Record<string, any>>(
      ENDPOINTS.covernote_verification,
      xml,
    );

    const res = raw?.["TiraMsg"]?.["CoverNoteVerificationRes"];
    const hdr = res?.["CoverNoteHdr"];
    const result: CoverNoteVerificationResponse = {
      response_id: hdr?.["ResponseId"] ?? "",
      request_id: hdr?.["RequestId"] ?? "",
      tira_status_code: hdr?.["ResponseStatusCode"] ?? "",
      tira_status_desc: hdr?.["ResponseStatusDesc"] ?? "",
    };

    if (result.tira_status_code === "TIRA001") {
      result.data = res?.["CoverNoteDtl"];
    }

    return result;
  }
}
