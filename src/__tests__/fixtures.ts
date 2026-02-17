import type { MotorCoverNotePayload } from "../types/motor.js";
import type { MotorVerificationPayload } from "../types/motor.js";
import type { TiraConfig } from "../types/config.js";

export const mockTiraConfig: TiraConfig = {
  client_code: "IB1076",
  client_key: "xRah1zzjGA7",
  system_code: "TP_GALCO_001",
  transacting_company_code: "IB1076",
  base_url: "https://example.com:8091",
  client_cert_path: "./certs/client.crt",
  client_key_path: "./certs/client.key",
  ca_cert_path: "./certs/tira_server_ca.pem",
  pfx_path: "./certs/tiramisclientprivate.pfx",
  pfx_passphrase: "password",
};

export const mockTiraConfigWithVerification: TiraConfig = {
  ...mockTiraConfig,
  tira_public_pfx_path: "./certs/tiramispublic.pfx",
  tira_public_pfx_passphrase: "password",
};

export const validCoverNotePayload: MotorCoverNotePayload = {
  request_id: "GLC-1234567890",
  callback_url: "https://example.com/callback",
  insurer_company_code: "ICC103",
  covernote_type: "1",
  covernote_number: "SPCPLBA123456",
  sales_point_code: "SP719",
  covernote_start_date: "2025-05-31T21:00:00Z",
  covernote_end_date: "2026-05-31T21:00:00Z",
  covernote_desc: "Private Vehicles",
  operative_clause: "Comprehensive",
  payment_mode: "3",
  total_premium_excluding_tax: 525000,
  total_premium_including_tax: 619500,
  commission_paid: 65625,
  commission_rate: 0.125,
  officer_name: "Johnson Abraham",
  officer_title: "Manager",
  product_code: "SP014001000000",
  risks_covered: [
    {
      risk_code: "SP014001000001",
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
          is_tax_exempted: "N",
          tax_rate: 0.18,
          tax_amount: 94500,
        },
      ],
    },
  ],
  subject_matters_covered: [
    {
      subject_matter_reference: "HSB001",
      subject_matter_desc: "Vehicle",
    },
  ],
  policy_holders: [
    {
      policyholder_name: "TEST CLIENT",
      policyholder_birthdate: "1984-06-19",
      policyholder_type: "1",
      policyholder_id_number: "19840619566676776857",
      policyholder_id_type: "1",
      gender: "F",
      country_code: "TZA",
      region: "Dar es Salaam",
      district: "Ilala",
      street: "Kariakoo",
      phone_number: "255712345678",
      postal_address: "DSM",
    },
  ],
  motor_details: {
    motor_category: "1",
    motor_type: "1",
    registration_number: "T123ABC",
    chassis_number: "1234567890",
    make: "Toyota",
    model: "RAV4",
    model_number: "2010",
    body_type: "STATION WAGON",
    color: "WHITE",
    engine_number: "984668484DDD",
    engine_capacity: "2360",
    fuel_used: "PETROL",
    number_of_axles: 2,
    axle_distance: 0,
    sitting_capacity: 5,
    year_of_manufacture: 2010,
    tare_weight: 1750,
    gross_weight: 1850,
    motor_usage: "1",
    owner_name: "TEST CLIENT",
    owner_category: "1",
    owner_address: "DSM",
  },
};

export const validVerificationPayload: MotorVerificationPayload = {
  request_id: "GLC-VERIFY-1234567890",
  motor_category: "1",
  motor_registration_number: "T337DSE",
};

export const sampleMotorCallbackXml = `<TiraMsg>
  <MotorCoverNoteRefRes>
    <ResponseId>RES-001</ResponseId>
    <RequestId>REQ-001</RequestId>
    <CoverNoteReferenceNumber>CN-2025-001</CoverNoteReferenceNumber>
    <StickerNumber>STK-2025-001</StickerNumber>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </MotorCoverNoteRefRes>
  <MsgSignature>abc123signature==</MsgSignature>
</TiraMsg>`;

export const sampleMotorCallbackParsed = {
  TiraMsg: {
    MotorCoverNoteRefRes: {
      ResponseId: "RES-001",
      RequestId: "REQ-001",
      CoverNoteReferenceNumber: "CN-2025-001",
      StickerNumber: "STK-2025-001",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "abc123signature==",
  },
};

export const sampleMotorCallbackErrorParsed = {
  TiraMsg: {
    MotorCoverNoteRefRes: {
      ResponseId: "RES-002",
      RequestId: "REQ-002",
      CoverNoteReferenceNumber: "",
      StickerNumber: "",
      ResponseStatusCode: "TIRA020",
      ResponseStatusDesc: "Invalid covernote start date",
    },
    MsgSignature: "xyz789signature==",
  },
};

export const sampleNonLifeOtherCallbackXml = `<TiraMsg>
  <CoverNoteRefRes>
    <ResponseId>RES-NLO-001</ResponseId>
    <RequestId>REQ-NLO-001</RequestId>
    <CoverNoteReferenceNumber>CN-NLO-2025-001</CoverNoteReferenceNumber>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </CoverNoteRefRes>
  <MsgSignature>abc123signature==</MsgSignature>
</TiraMsg>`;

export const sampleNonLifeOtherCallbackParsed = {
  TiraMsg: {
    CoverNoteRefRes: {
      ResponseId: "RES-NLO-001",
      RequestId: "REQ-NLO-001",
      CoverNoteReferenceNumber: "CN-NLO-2025-001",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "abc123signature==",
  },
};
