import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { MotorCoverNotePayload } from "../types/motor.js";

export function buildMotorCoverNoteXml(
  payload: MotorCoverNotePayload,
  config: TiraConfig,
): string {
  const startDate = new Date(payload.covernote_start_date);
  const endDate = new Date(payload.covernote_end_date);

  const currencyCode = payload.currency_code ?? "TZS";
  const exchangeRate = payload.exchange_rate ?? 1.0;
  const m = payload.motor_details;

  return create({ version: "1.0" })
    .ele({
      MotorCoverNoteRefReq: {
        CoverNoteHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
          CallBackUrl: payload.callback_url,
          InsurerCompanyCode: payload.insurer_company_code,
          TranCompanyCode: config.transacting_company_code,
          CoverNoteType: payload.covernote_type,
        },
        CoverNoteDtl: {
          CoverNoteNumber: payload.covernote_number ?? "",
          PrevCoverNoteReferenceNumber:
            payload.previous_covernote_reference_number ?? "",
          SalePointCode: payload.sales_point_code,
          CoverNoteStartDate: startDate.toISOString().substring(0, 19),
          CoverNoteEndDate: endDate.toISOString().substring(0, 19),
          CoverNoteDesc: payload.covernote_desc,
          OperativeClause: payload.operative_clause,
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
            : "",
          CommisionRate: payload.commission_rate
            ? Number(payload.commission_rate).toFixed(5)
            : "",
          OfficerName: payload.officer_name,
          OfficerTitle: payload.officer_title,
          ProductCode: payload.product_code,
          EndorsementType: payload.endorsement_type ?? "",
          EndorsementReason: payload.endorsement_reason ?? "",
          EndorsementPremiumEarned: payload.endorsement_premium_earned ?? "0",
          RisksCovered: {
            RiskCovered: payload.risks_covered.map((r) => ({
              RiskCode: r.risk_code,
              SumInsured: Number(r.sum_insured).toFixed(2),
              SumInsuredEquivalent: Number(r.sum_insured_equivalent).toFixed(2),
              PremiumRate: Number(r.premium_rate).toFixed(5),
              PremiumBeforeDiscount: Number(r.premium_before_discount).toFixed(
                2,
              ),
              PremiumAfterDiscount: Number(r.premium_after_discount).toFixed(2),
              PremiumExcludingTaxEquivalent: Number(
                r.premium_excluding_tax_equivalent,
              ).toFixed(2),
              PremiumIncludingTax: Number(r.premium_including_tax).toFixed(2),
              DiscountsOffered: r.discounts_offered
                ? {
                    DiscountOffered: r.discounts_offered.map((d) => ({
                      DiscountType: d.discount_type,
                      DiscountRate: Number(d.discount_rate).toFixed(5),
                      DiscountAmount: Number(d.discount_amount).toFixed(2),
                    })),
                  }
                : "",
              TaxesCharged: {
                TaxCharged: r.taxes_charged.map((t) => ({
                  TaxCode: t.tax_code,
                  IsTaxExempted: t.is_tax_exempted,
                  TaxExemptionType: t.tax_exemption_type ?? "",
                  TaxExemptionReference: t.tax_exemption_reference ?? "",
                  TaxRate: Number(t.tax_rate).toFixed(5),
                  TaxAmount: Number(t.tax_amount).toFixed(2),
                })),
              },
            })),
          },
          SubjectMattersCovered: {
            SubjectMatter: payload.subject_matters_covered.map((s) => ({
              SubjectMatterReference: s.subject_matter_reference,
              SubjectMatterDesc: s.subject_matter_desc,
            })),
          },
          CoverNoteAddons: {
            CoverNoteAddon: (payload.covernote_addons ?? []).map((a) => ({
              AddonReference: a.addon_reference,
              AddonDesc: a.addon_description,
              AddonAmount: Number(a.addon_amount).toFixed(2),
              AddonPremiumRate: Number(a.addon_premium_rate).toFixed(5),
              PremiumExcludingTax: Number(a.premium_excluding_tax).toFixed(2),
              PremiumExcludingTaxEquivalent: Number(
                a.premium_excluding_tax_equivalent,
              ).toFixed(2),
              PremiumIncludingTax: Number(a.premium_including_tax).toFixed(2),
              TaxesCharged: {
                TaxCharged: a.taxes_charged.map((t) => ({
                  TaxCode: t.tax_code,
                  IsTaxExempted: t.is_tax_exempted,
                  TaxExemptionType: t.tax_exemption_type ?? "",
                  TaxExemptionReference: t.tax_exemption_reference ?? "",
                  TaxRate: Number(t.tax_rate).toFixed(5),
                  TaxAmount: Number(t.tax_amount).toFixed(2),
                })),
              },
            })),
          },
          PolicyHolders: {
            PolicyHolder: payload.policy_holders.map((p) => ({
              PolicyHolderName: p.policyholder_name,
              PolicyHolderBirthDate: p.policyholder_birthdate,
              PolicyHolderType: p.policyholder_type,
              PolicyHolderIdNumber: p.policyholder_id_number,
              PolicyHolderIdType: p.policyholder_id_type,
              Gender: p.gender,
              CountryCode: p.country_code ?? "TZA",
              Region: p.region,
              District: p.district,
              Street: p.street,
              PolicyHolderPhoneNumber: p.phone_number,
              PolicyHolderFax: p.fax_number ?? "",
              PostalAddress: p.postal_address,
              EmailAddress: p.email_address ?? "",
            })),
          },
          MotorDtl: {
            MotorCategory: m.motor_category,
            MotorType: m.motor_type,
            RegistrationNumber: m.registration_number ?? "",
            ChassisNumber: m.chassis_number,
            Make: m.make,
            Model: m.model,
            ModelNumber: m.model_number,
            BodyType: m.body_type,
            Color: m.color,
            EngineNumber: m.engine_number,
            EngineCapacity: m.engine_capacity,
            FuelUsed: m.fuel_used,
            NumberOfAxles: m.number_of_axles ?? "",
            AxleDistance: m.axle_distance ?? "0",
            SittingCapacity: m.sitting_capacity ?? "",
            YearOfManufacture: m.year_of_manufacture,
            TareWeight: m.tare_weight,
            GrossWeight: m.gross_weight,
            MotorUsage: m.motor_usage,
            OwnerName: m.owner_name,
            OwnerCategory: m.owner_category,
            OwnerAddress: m.owner_address,
          },
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
