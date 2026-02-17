import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { ClaimNotificationPayload } from "../types/claim-notification.js";
import { formatDateForTira } from "../utils.js";

export function buildClaimNotificationXml(
  payload: ClaimNotificationPayload,
  config: TiraConfig,
): string {
  return create({ version: "1.0" })
    .ele({
      ClaimNotificationRefReq: {
        ClaimNotificationHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
          CallBackUrl: payload.callback_url,
          InsurerCompanyCode: payload.insurer_company_code,
          TranCompanyCode: config.transacting_company_code,
        },
        ClaimNotificationDtl: {
          ClaimNotificationNumber: payload.claim_notification_number,
          CoverNoteReferenceNumber: payload.covernote_reference_number,
          ClaimReportDate: formatDateForTira(payload.claim_report_date),
          ClaimFormDullyFilled: payload.claim_form_dully_filled,
          LossDate: formatDateForTira(payload.loss_date),
          LossNature: payload.loss_nature,
          LossType: payload.loss_type,
          LossLocation: payload.loss_location,
          OfficerName: payload.officer_name,
          OfficerTitle: payload.officer_title,
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
