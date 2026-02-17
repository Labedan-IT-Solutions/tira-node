import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { ClaimIntimationPayload } from "../types/claim-intimation.js";
import { formatDateForTira } from "../utils.js";

export function buildClaimIntimationXml(
  payload: ClaimIntimationPayload,
  config: TiraConfig,
): string {
  const currencyCode = payload.currency_code ?? "TZS";
  const exchangeRate = payload.exchange_rate ?? 1.0;

  const claimantArray = payload.claimants.map((c) => ({
    ClaimantName: c.claimant_name,
    ClaimantBirthDate: c.claimant_birth_date,
    ClaimantCategory: c.claimant_category,
    ClaimantType: c.claimant_type,
    ClaimantIdNumber: c.claimant_id_number,
    ClaimantIdType: c.claimant_id_type,
    Gender: c.gender ?? "",
    CountryCode: c.country_code ?? "TZA",
    Region: c.region,
    District: c.district,
    Street: c.street ?? "",
    ClaimantPhoneNumber: c.claimant_phone_number,
    ClaimantFax: c.claimant_fax ?? "",
    PostalAddress: c.postal_address ?? "",
    EmailAddress: c.email_address ?? "",
  }));

  return create({ version: "1.0" })
    .ele({
      ClaimIntimationReq: {
        ClaimIntimationHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
          CallBackUrl: payload.callback_url,
          InsurerCompanyCode: payload.insurer_company_code,
        },
        ClaimIntimationDtl: {
          ClaimIntimationNumber: payload.claim_intimation_number,
          ClaimReferenceNumber: payload.claim_reference_number,
          CoverNoteReferenceNumber: payload.covernote_reference_number,
          ClaimIntimationDate: formatDateForTira(
            payload.claim_intimation_date,
          ),
          CurrencyCode: currencyCode,
          ExchangeRate: exchangeRate.toFixed(2),
          ClaimEstimatedAmount: Number(
            payload.claim_estimated_amount,
          ).toFixed(2),
          ClaimReserveAmount: Number(payload.claim_reserve_amount).toFixed(2),
          ClaimReserveMethod: payload.claim_reserve_method,
          LossAssessmentOption: payload.loss_assessment_option,
          AssessorName: payload.assessor_name,
          AssessorIdNumber: payload.assessor_id_number,
          AssessorIdType: payload.assessor_id_type,
          Claimants: {
            Claimant: claimantArray,
          },
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
