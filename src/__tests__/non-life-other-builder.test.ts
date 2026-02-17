import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildNonLifeOtherCoverNoteXml } from "../builders/non-life-other.js";
import { mockTiraConfig } from "./fixtures.js";
import type { NonLifeOtherCoverNotePayload } from "../types/non-life-other.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

const validNonLifeOtherPayload: NonLifeOtherCoverNotePayload = {
  request_id: "LABEDAN-NLO-1234567890",
  callback_url: "https://example.com/callback",
  insurer_company_code: "ICC103",
  covernote_type: "1",
  covernote_number: "SPCPLBA123456",
  sales_point_code: "SP719",
  covernote_start_date: "2025-05-31T21:00:00Z",
  covernote_end_date: "2026-05-31T21:00:00Z",
  covernote_desc: "Fire Insurance",
  operative_clause: "Standard Fire",
  payment_mode: "3",
  total_premium_excluding_tax: 525000,
  total_premium_including_tax: 619500,
  commission_paid: 65625,
  commission_rate: 0.125,
  officer_name: "Johnson Abraham",
  officer_title: "Manager",
  product_code: "SP014002000000",
  risks_covered: [
    {
      risk_code: "SP014002000001",
      sum_insured: 15000000,
      sum_insured_equivalent: 15000000,
      premium_rate: 0.035,
      premium_before_discount: 525000,
      premium_after_discount: 525000,
      premium_excluding_tax_equivalent: 525000,
      premium_including_tax: 619500,
      taxes_charged: [
        {
          tax_code: "VAT-MAINLAND",
          is_tax_exempted: "N" as const,
          tax_rate: 0.18,
          tax_amount: 94500,
        },
      ],
    },
  ],
  subject_matters_covered: [
    {
      subject_matter_reference: "BLD001",
      subject_matter_desc: "Commercial Building",
    },
  ],
  policy_holders: [
    {
      policyholder_name: "TEST CLIENT",
      policyholder_birthdate: "1984-06-19",
      policyholder_type: "1" as const,
      policyholder_id_number: "19840619566676776857",
      policyholder_id_type: "1" as const,
      gender: "F" as const,
      country_code: "TZA",
      region: "Dar es Salaam",
      district: "Ilala",
      street: "Kariakoo",
      phone_number: "255712345678",
      postal_address: "DSM",
    },
  ],
};

describe("buildNonLifeOtherCoverNoteXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildNonLifeOtherCoverNoteXml(
      validNonLifeOtherPayload,
      mockTiraConfig,
    );
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is CoverNoteRefReq", async () => {
    const xml = buildNonLifeOtherCoverNoteXml(
      validNonLifeOtherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("CoverNoteRefReq");
    expect(parsed).not.toHaveProperty("MotorCoverNoteRefReq");
  });

  it("CoverNoteHdr contains config fields", async () => {
    const xml = buildNonLifeOtherCoverNoteXml(
      validNonLifeOtherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.CoverNoteRefReq.CoverNoteHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
    expect(hdr.RequestId).toBe(validNonLifeOtherPayload.request_id);
    expect(hdr.TranCompanyCode).toBe(mockTiraConfig.transacting_company_code);
  });

  it("premium values are formatted with .toFixed(2)", async () => {
    const xml = buildNonLifeOtherCoverNoteXml(
      validNonLifeOtherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.CoverNoteRefReq.CoverNoteDtl;
    expect(dtl.TotalPremiumExcludingTax).toBe("525000.00");
    expect(dtl.TotalPremiumIncludingTax).toBe("619500.00");
  });

  it("dates are converted from UTC to GMT+3", async () => {
    const xml = buildNonLifeOtherCoverNoteXml(
      validNonLifeOtherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.CoverNoteRefReq.CoverNoteDtl;
    expect(dtl.CoverNoteStartDate).toBe("2025-06-01T00:00:00");
    expect(dtl.CoverNoteEndDate).toBe("2026-06-01T00:00:00");
  });

  it("does NOT contain MotorDtl", async () => {
    const xml = buildNonLifeOtherCoverNoteXml(
      validNonLifeOtherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.CoverNoteRefReq.CoverNoteDtl;
    expect(dtl).not.toHaveProperty("MotorDtl");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildNonLifeOtherCoverNoteXml(
      validNonLifeOtherPayload,
      mockTiraConfig,
    );
    expect(xml).not.toMatch(/^<\?xml/);
  });

  it("defaults currency_code to 'TZS'", async () => {
    const payload = { ...validNonLifeOtherPayload, currency_code: undefined };
    const xml = buildNonLifeOtherCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    expect(parsed.CoverNoteRefReq.CoverNoteDtl.CurrencyCode).toBe("TZS");
  });

  it("country_code defaults to 'TZA' for policy holder", async () => {
    const payload = {
      ...validNonLifeOtherPayload,
      policy_holders: [
        {
          ...validNonLifeOtherPayload.policy_holders[0]!,
          country_code: undefined,
        },
      ],
    };
    const xml = buildNonLifeOtherCoverNoteXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const ph = parsed.CoverNoteRefReq.CoverNoteDtl.PolicyHolders.PolicyHolder;
    expect(ph.CountryCode).toBe("TZA");
  });

  it("tax values formatted correctly", async () => {
    const xml = buildNonLifeOtherCoverNoteXml(
      validNonLifeOtherPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const risk = parsed.CoverNoteRefReq.CoverNoteDtl.RisksCovered.RiskCovered;
    const tax = risk.TaxesCharged.TaxCharged;
    expect(tax.TaxAmount).toBe("94500.00");
    expect(tax.TaxRate).toBe("0.18000");
    expect(tax.TaxCode).toBe("VAT-MAINLAND");
    expect(tax.IsTaxExempted).toBe("N");
  });
});
