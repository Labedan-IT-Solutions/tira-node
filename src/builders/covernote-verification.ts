import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { CoverNoteVerificationPayload } from "../types/covernote-verification.js";

export function buildCoverNoteVerificationXml(
  payload: CoverNoteVerificationPayload,
  config: TiraConfig,
): string {
  return create({ version: "1.0" })
    .ele({
      CoverNoteVerificationReq: {
        VerificationHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
        },
        VerificationDtl: {
          CoverNoteReferenceNumber: payload.covernote_reference_number,
          StickerNumber: payload.sticker_number ?? "",
          MotorRegistrationNumber: payload.motor_registration_number ?? "",
          MotorChassisNumber: payload.motor_chassis_number ?? "",
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
