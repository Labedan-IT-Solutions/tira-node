import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { ReinsurancePayload } from "../types/reinsurance.js";
import { formatDateForTira } from "../utils.js";

export function buildReinsuranceXml(
  payload: ReinsurancePayload,
  config: TiraConfig,
): string {
  const currencyCode = payload.currency_code ?? "TZS";
  const exchangeRate = payload.exchange_rate ?? 1.0;

  const reinsuranceDtls = payload.reinsurance_details.map((d) => ({
    ParticipantCode: d.participant_code,
    ParticipantType: d.participant_type,
    ReinsuranceForm: d.reinsurance_form,
    ReinsuranceType: d.reinsurance_type,
    ReBrokerCode: d.re_broker_code ?? "",
    BrokerageCommission: Number(d.brokerage_commission).toFixed(2),
    ReinsuranceCommission: Number(d.reinsurance_commission).toFixed(2),
    PremiumShare: Number(d.premium_share).toFixed(2),
    ParticipationDate: formatDateForTira(d.participation_date),
  }));

  return create({ version: "1.0" })
    .ele({
      ReinsuranceReq: {
        ReinsuranceHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
          CallBackUrl: payload.callback_url,
          InsurerCompanyCode: payload.insurer_company_code,
          CoverNoteReferenceNumber: payload.covernote_reference_number,
          PremiumIncludingTax: Number(payload.premium_including_tax).toFixed(2),
          CurrencyCode: currencyCode,
          ExchangeRate: exchangeRate.toFixed(2),
          AuthorizingOfficerName: payload.authorizing_officer_name,
          AuthorizingOfficerTitle: payload.authorizing_officer_title,
          ReinsuranceCategory: payload.reinsurance_category,
        },
        ReinsuranceDtl: reinsuranceDtls,
      },
    })
    .end({ prettyPrint: false, headless: true });
}
