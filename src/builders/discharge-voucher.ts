import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { DischargeVoucherPayload } from "../types/discharge-voucher.js";
import { formatDateForTira } from "../utils.js";

export function buildDischargeVoucherXml(
  payload: DischargeVoucherPayload,
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
      DischargeVoucherReq: {
        DischargeVoucherHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
          CallBackUrl: payload.callback_url,
          InsurerCompanyCode: payload.insurer_company_code,
        },
        DischargeVoucherDtl: {
          DischargeVoucherNumber: payload.discharge_voucher_number,
          ClaimAssessmentNumber: payload.claim_assessment_number,
          ClaimReferenceNumber: payload.claim_reference_number,
          CoverNoteReferenceNumber: payload.covernote_reference_number,
          DischargeVoucherDate: formatDateForTira(
            payload.discharge_voucher_date,
          ),
          CurrencyCode: currencyCode,
          ExchangeRate: exchangeRate.toFixed(2),
          ClaimOfferCommunicationDate: formatDateForTira(
            payload.claim_offer_communication_date,
          ),
          ClaimOfferAmount: Number(payload.claim_offer_amount).toFixed(2),
          ClaimantResponseDate: formatDateForTira(
            payload.claimant_response_date,
          ),
          AdjustmentDate: formatDateForTira(payload.adjustment_date),
          AdjustmentReason: payload.adjustment_reason,
          AdjustmentAmount: Number(payload.adjustment_amount).toFixed(2),
          ReconciliationDate: formatDateForTira(payload.reconciliation_date),
          ReconciliationSummary: payload.reconciliation_summary,
          ReconciledAmount: Number(payload.reconciled_amount).toFixed(2),
          OfferAccepted: payload.offer_accepted,
          Claimants: {
            Claimant: claimantArray,
          },
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
