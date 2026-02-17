import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { ClaimAssessmentPayload } from "../types/claim-assessment.js";
import { formatDateForTira } from "../utils.js";

export function buildClaimAssessmentXml(
  payload: ClaimAssessmentPayload,
  config: TiraConfig,
): string {
  const currencyCode = payload.currency_code ?? "TZS";
  const exchangeRate = payload.exchange_rate ?? 1.0;

  const claimantArray = payload.claimants.map((c) => ({
    ClaimantCategory: c.claimant_category,
    ClaimantType: c.claimant_type,
    ClaimantIdNumber: c.claimant_id_number,
    ClaimantIdType: c.claimant_id_type,
  }));

  return create({ version: "1.0" })
    .ele({
      ClaimAssessmentReq: {
        ClaimAssessmentHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
          CallBackUrl: payload.callback_url,
          InsurerCompanyCode: payload.insurer_company_code,
        },
        ClaimAssessmentDtl: {
          ClaimAssessmentNumber: payload.claim_assessment_number,
          ClaimIntimationNumber: payload.claim_intimation_number,
          ClaimReferenceNumber: payload.claim_reference_number,
          CoverNoteReferenceNumber: payload.covernote_reference_number,
          AssessmentReceivedDate: formatDateForTira(
            payload.assessment_received_date,
          ),
          AssessmentReportSummary: payload.assessment_report_summary,
          CurrencyCode: currencyCode,
          ExchangeRate: exchangeRate.toFixed(2),
          AssessmentAmount: Number(payload.assessment_amount).toFixed(2),
          ApprovedClaimAmount: Number(payload.approved_claim_amount).toFixed(2),
          ClaimApprovalDate: formatDateForTira(payload.claim_approval_date),
          ClaimApprovalAuthority: payload.claim_approval_authority,
          IsReAssessment: payload.is_re_assessment,
          Claimants: {
            Claimant: claimantArray,
          },
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
