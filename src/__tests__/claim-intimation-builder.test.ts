import { describe, it, expect } from "vitest";
import { parseStringPromise } from "xml2js";
import { buildClaimIntimationXml } from "../builders/claim-intimation.js";
import { validClaimIntimationPayload, mockTiraConfig } from "./fixtures.js";
import { formatDateForTira } from "../utils.js";

async function parseXml(xml: string): Promise<Record<string, any>> {
  return parseStringPromise(xml, { explicitArray: false });
}

describe("buildClaimIntimationXml", () => {
  it("produces valid XML that can be parsed back", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    await expect(parseXml(xml)).resolves.toBeDefined();
  });

  it("root element is ClaimIntimationReq", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    expect(parsed).toHaveProperty("ClaimIntimationReq");
  });

  it("ClaimIntimationHdr contains config fields", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimIntimationReq.ClaimIntimationHdr;
    expect(hdr.CompanyCode).toBe(mockTiraConfig.client_code);
    expect(hdr.SystemCode).toBe(mockTiraConfig.system_code);
  });

  it("ClaimIntimationHdr contains payload fields", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const hdr = parsed.ClaimIntimationReq.ClaimIntimationHdr;
    expect(hdr.RequestId).toBe(validClaimIntimationPayload.request_id);
    expect(hdr.CallBackUrl).toBe(validClaimIntimationPayload.callback_url);
    expect(hdr.InsurerCompanyCode).toBe(
      validClaimIntimationPayload.insurer_company_code,
    );
  });

  it("ClaimIntimationDtl has all mandatory text fields", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimIntimationReq.ClaimIntimationDtl;
    expect(dtl.ClaimIntimationNumber).toBe("322WQ25234234");
    expect(dtl.ClaimReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.CoverNoteReferenceNumber).toBe("10020-25400-07720");
    expect(dtl.ClaimReserveMethod).toBe("Chain Ladder");
    expect(dtl.LossAssessmentOption).toBe("1");
    expect(dtl.AssessorName).toBe("Baraka Kiswigu");
    expect(dtl.AssessorIdNumber).toBe("124214114");
    expect(dtl.AssessorIdType).toBe("1");
  });

  it("numeric fields are formatted to 2 decimal places", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimIntimationReq.ClaimIntimationDtl;
    expect(dtl.ExchangeRate).toBe("2000.00");
    expect(dtl.ClaimEstimatedAmount).toBe("2000000.00");
    expect(dtl.ClaimReserveAmount).toBe("1000000.00");
  });

  it("claim_intimation_date is formatted via formatDateForTira", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimIntimationReq.ClaimIntimationDtl;
    const expected = formatDateForTira(
      validClaimIntimationPayload.claim_intimation_date,
    );
    expect(dtl.ClaimIntimationDate).toBe(expected);
  });

  it("currency_code defaults to TZS when not provided", async () => {
    const payload = { ...validClaimIntimationPayload, currency_code: undefined };
    const xml = buildClaimIntimationXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimIntimationReq.ClaimIntimationDtl;
    expect(dtl.CurrencyCode).toBe("TZS");
  });

  it("exchange_rate defaults to 1.00 when not provided", async () => {
    const payload = { ...validClaimIntimationPayload, exchange_rate: undefined };
    const xml = buildClaimIntimationXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const dtl = parsed.ClaimIntimationReq.ClaimIntimationDtl;
    expect(dtl.ExchangeRate).toBe("1.00");
  });

  it("renders Claimants with multiple Claimant entries", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const claimants =
      parsed.ClaimIntimationReq.ClaimIntimationDtl.Claimants.Claimant;
    expect(Array.isArray(claimants)).toBe(true);
    expect(claimants).toHaveLength(2);
    expect(claimants[0].ClaimantName).toBe("Augustino Aidan Mwageni");
    expect(claimants[1].ClaimantName).toBe("KISWIGU Company Ltd");
  });

  it("claimant fields are mapped correctly", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const c =
      parsed.ClaimIntimationReq.ClaimIntimationDtl.Claimants.Claimant[0];
    expect(c.ClaimantBirthDate).toBe("1920-02-05");
    expect(c.ClaimantCategory).toBe("2");
    expect(c.ClaimantType).toBe("1");
    expect(c.ClaimantIdNumber).toBe("24241241");
    expect(c.ClaimantIdType).toBe("1");
    expect(c.CountryCode).toBe("TZA");
    expect(c.Region).toBe("Dar es Salaam");
    expect(c.District).toBe("Ilala");
    expect(c.ClaimantPhoneNumber).toBe("255713525539");
  });

  it("claimant optional fields default to empty string", async () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    const parsed = await parseXml(xml);
    const c =
      parsed.ClaimIntimationReq.ClaimIntimationDtl.Claimants.Claimant[0];
    expect(c.Gender).toBe("");
    expect(c.Street).toBe("");
    expect(c.ClaimantFax).toBe("");
    expect(c.PostalAddress).toBe("");
    expect(c.EmailAddress).toBe("");
  });

  it("claimant country_code defaults to TZA when not provided", async () => {
    const payload = {
      ...validClaimIntimationPayload,
      claimants: [
        {
          ...validClaimIntimationPayload.claimants[0]!,
          country_code: undefined,
        },
      ],
    };
    const xml = buildClaimIntimationXml(payload, mockTiraConfig);
    const parsed = await parseXml(xml);
    const c =
      parsed.ClaimIntimationReq.ClaimIntimationDtl.Claimants.Claimant;
    expect(c.CountryCode).toBe("TZA");
  });

  it("output is headless (no XML declaration)", () => {
    const xml = buildClaimIntimationXml(
      validClaimIntimationPayload,
      mockTiraConfig,
    );
    expect(xml).not.toMatch(/^<\?xml/);
  });
});
