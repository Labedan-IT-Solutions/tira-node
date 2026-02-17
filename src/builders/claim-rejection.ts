import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { ClaimRejectionPayload } from "../types/claim-rejection.js";
import { formatDateForTira } from "../utils.js";

export function buildClaimRejectionXml(
  payload: ClaimRejectionPayload,
  config: TiraConfig,
): string {
  const claimantArray = payload.claimants.map((c) => ({
    ClaimantCategory: c.claimant_category,
    ClaimantType: c.claimant_type,
    ClaimantIdNumber: c.claimant_id_number,
    ClaimantIdType: c.claimant_id_type,
  }));

  return create({ version: "1.0" })
    .ele({
      ClaimRejectionReq: {
        ClaimRejectionHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
          CallBackUrl: payload.callback_url,
          InsurerCompanyCode: payload.insurer_company_code,
        },
        ClaimRejectionDtl: {
          ClaimRejectionNumber: payload.claim_rejection_number,
          ClaimReferenceNumber: payload.claim_reference_number,
          ClaimIntimationNumber: payload.claim_intimation_number,
          CoverNoteReferenceNumber: payload.covernote_reference_number,
          RejectionDate: formatDateForTira(payload.rejection_date),
          RejectionReason: payload.rejection_reason,
          ClaimResultedLitigation: payload.claim_resulted_litigation,
          ClaimAmount: Number(payload.claim_amount).toFixed(2),
          CurrencyCode: payload.currency_code,
          ExchangeRate: Number(payload.exchange_rate).toFixed(2),
          Claimants: {
            Claimant: claimantArray,
          },
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
