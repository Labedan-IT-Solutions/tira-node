import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { ClaimPaymentPayload } from "../types/claim-payment.js";
import { formatDateForTira } from "../utils.js";

export function buildClaimPaymentXml(
  payload: ClaimPaymentPayload,
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
      ClaimPaymentReq: {
        ClaimPaymentHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
          CallBackUrl: payload.callback_url,
          InsurerCompanyCode: payload.insurer_company_code,
        },
        ClaimPaymentDtl: {
          ClaimPaymentNumber: payload.claim_payment_number,
          ClaimReferenceNumber: payload.claim_reference_number,
          ClaimIntimationNumber: payload.claim_intimation_number,
          CoverNoteReferenceNumber: payload.covernote_reference_number,
          PaymentDate: formatDateForTira(payload.payment_date),
          PaidAmount: Number(payload.paid_amount).toFixed(2),
          PaymentMode: payload.payment_mode,
          PartiesNotified: payload.parties_notified,
          NetPremiumEarned: Number(payload.net_premium_earned).toFixed(2),
          ClaimResultedLitigation: payload.claim_resulted_litigation,
          LitigationReason: payload.litigation_reason,
          CurrencyCode: currencyCode,
          ExchangeRate: exchangeRate.toFixed(2),
          Claimants: {
            Claimant: claimantArray,
          },
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
