import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { MotorFleetCoverNotePayload } from "../types/motor-fleet.js";
import {
  buildCoverNoteHdr,
  buildRisksCoveredXml,
  buildSubjectMattersXml,
  buildCoverNoteAddonsXml,
  buildPolicyHoldersXml,
} from "./covernote.js";
import { buildMotorDtlXml } from "./motor.js";
import { formatDateForTira } from "../utils.js";

export function buildMotorFleetCoverNoteXml(
  payload: MotorFleetCoverNotePayload,
  config: TiraConfig,
): string {
  const currencyCode = payload.currency_code ?? "TZS";
  const exchangeRate = payload.exchange_rate ?? 1.0;

  const fleetDtlArray = payload.fleet_details.map((fd) => ({
    FleetEntry: fd.fleet_entry,
    CoverNoteNumber: fd.covernote_number,
    PrevCoverNoteReferenceNumber:
      fd.previous_covernote_reference_number ?? "",
    CoverNoteDesc: fd.covernote_desc,
    OperativeClause: fd.operative_clause,
    EndorsementType: fd.endorsement_type ?? "",
    EndorsementReason: fd.endorsement_reason ?? "",
    EndorsementPremiumEarned: fd.endorsement_premium_earned ?? "",
    RisksCovered: buildRisksCoveredXml(fd.risks_covered),
    SubjectMattersCovered: buildSubjectMattersXml(fd.subject_matters_covered),
    CoverNoteAddons: buildCoverNoteAddonsXml(fd.covernote_addons),
    MotorDtl: buildMotorDtlXml(fd.motor_details),
  }));

  return create({ version: "1.0" })
    .ele({
      MotorCoverNoteRefReq: {
        CoverNoteHdr: buildCoverNoteHdr(payload, config),
        CoverNoteDtl: {
          FleetHdr: {
            FleetId: payload.fleet_id,
            FleetType: payload.fleet_type,
            FleetSize: payload.fleet_size,
            ComprehensiveInsured: payload.comprehensive_insured ?? "",
            SalePointCode: payload.sales_point_code,
            CoverNoteStartDate: formatDateForTira(payload.covernote_start_date),
            CoverNoteEndDate: formatDateForTira(payload.covernote_end_date),
            PaymentMode: payload.payment_mode,
            CurrencyCode: currencyCode,
            ExchangeRate: exchangeRate.toFixed(2),
            TotalPremiumExcludingTax: Number(
              payload.total_premium_excluding_tax,
            ).toFixed(2),
            TotalPremiumIncludingTax: Number(
              payload.total_premium_including_tax,
            ).toFixed(2),
            CommisionPaid: payload.commission_paid
              ? Number(payload.commission_paid).toFixed(2)
              : "0.00",
            CommisionRate: payload.commission_rate
              ? Number(payload.commission_rate).toFixed(2)
              : "0.00",
            OfficerName: payload.officer_name,
            OfficerTitle: payload.officer_title,
            ProductCode: payload.product_code,
            PolicyHolders: buildPolicyHoldersXml(payload.policy_holders),
          },
          FleetDtl: fleetDtlArray,
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
