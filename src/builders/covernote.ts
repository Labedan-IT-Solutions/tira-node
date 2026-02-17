import type { TiraConfig } from "../types/config.js";
import type { CoverNotePayloadBase } from "../types/common.js";
import { formatDateForTira } from "../utils.js";

export function buildCoverNoteHdr(
  payload: CoverNotePayloadBase,
  config: TiraConfig,
): Record<string, string> {
  return {
    RequestId: payload.request_id,
    CompanyCode: config.client_code,
    SystemCode: config.system_code,
    CallBackUrl: payload.callback_url,
    InsurerCompanyCode: payload.insurer_company_code,
    TranCompanyCode: config.transacting_company_code,
    CoverNoteType: payload.covernote_type,
  };
}

export function buildCoverNoteDtl(
  payload: CoverNotePayloadBase,
): Record<string, any> {
  const currencyCode = payload.currency_code ?? "TZS";
  const exchangeRate = payload.exchange_rate ?? 1.0;

  return {
    CoverNoteNumber: payload.covernote_number ?? "",
    PrevCoverNoteReferenceNumber:
      payload.previous_covernote_reference_number ?? "",
    SalePointCode: payload.sales_point_code,
    CoverNoteStartDate: formatDateForTira(payload.covernote_start_date),
    CoverNoteEndDate: formatDateForTira(payload.covernote_end_date),
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
        PremiumBeforeDiscount: Number(r.premium_before_discount).toFixed(2),
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
  };
}
