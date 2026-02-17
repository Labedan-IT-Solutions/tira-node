import type { MotorCoverNotePayload } from "../types/motor.js";
import type { MotorVerificationPayload } from "../types/motor.js";
import type { TiraConfig } from "../types/config.js";
import type {
  MotorFleetCoverNotePayload,
  FleetDetailEntry,
} from "../types/motor-fleet.js";
import type {
  ReinsurancePayload,
  ReinsuranceDetail,
} from "../types/reinsurance.js";
import type { PolicyPayload, PolicyDetail } from "../types/policy.js";
import type { ClaimNotificationPayload } from "../types/claim-notification.js";
import type { CoverNoteVerificationPayload } from "../types/covernote-verification.js";
import type { ClaimIntimationPayload } from "../types/claim-intimation.js";
import type { ClaimAssessmentPayload } from "../types/claim-assessment.js";
import type { DischargeVoucherPayload } from "../types/discharge-voucher.js";
import type { ClaimPaymentPayload } from "../types/claim-payment.js";
import type { ClaimRejectionPayload } from "../types/claim-rejection.js";

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
  request_id: "LABEDAN-1234567890",
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
  request_id: "LABEDAN-VERIFY-1234567890",
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

export const sampleFleetCallbackXml = `<TiraMsg>
  <MotorCoverNoteRefRes>
    <FleetResHdr>
      <ResponseId>RES-FLT-001</ResponseId>
      <RequestId>REQ-FLT-001</RequestId>
      <FleetId>FLT-001</FleetId>
      <FleetStatusCode>TIRA001</FleetStatusCode>
      <FleetStatusDesc>All vehicles processed successfully</FleetStatusDesc>
    </FleetResHdr>
    <FleetResDtl>
      <FleetEntry>1</FleetEntry>
      <CoverNoteNumber>SPCPLBA000001</CoverNoteNumber>
      <CoverNoteReferenceNumber>CN-FLT-2025-001</CoverNoteReferenceNumber>
      <StickerNumber>STK-FLT-2025-001</StickerNumber>
      <ResponseStatusCode>TIRA001</ResponseStatusCode>
      <ResponseStatusDesc>Successful</ResponseStatusDesc>
    </FleetResDtl>
    <FleetResDtl>
      <FleetEntry>2</FleetEntry>
      <CoverNoteNumber>SPCPLBA000002</CoverNoteNumber>
      <CoverNoteReferenceNumber>CN-FLT-2025-002</CoverNoteReferenceNumber>
      <StickerNumber>STK-FLT-2025-002</StickerNumber>
      <ResponseStatusCode>TIRA001</ResponseStatusCode>
      <ResponseStatusDesc>Successful</ResponseStatusDesc>
    </FleetResDtl>
  </MotorCoverNoteRefRes>
  <MsgSignature>fleet-sig-abc123==</MsgSignature>
</TiraMsg>`;

export const sampleFleetCallbackParsed = {
  TiraMsg: {
    MotorCoverNoteRefRes: {
      FleetResHdr: {
        ResponseId: "RES-FLT-001",
        RequestId: "REQ-FLT-001",
        FleetId: "FLT-001",
        FleetStatusCode: "TIRA001",
        FleetStatusDesc: "All vehicles processed successfully",
      },
      FleetResDtl: [
        {
          FleetEntry: "1",
          CoverNoteNumber: "SPCPLBA000001",
          CoverNoteReferenceNumber: "CN-FLT-2025-001",
          StickerNumber: "STK-FLT-2025-001",
          ResponseStatusCode: "TIRA001",
          ResponseStatusDesc: "Successful",
        },
        {
          FleetEntry: "2",
          CoverNoteNumber: "SPCPLBA000002",
          CoverNoteReferenceNumber: "CN-FLT-2025-002",
          StickerNumber: "STK-FLT-2025-002",
          ResponseStatusCode: "TIRA001",
          ResponseStatusDesc: "Successful",
        },
      ],
    },
    MsgSignature: "fleet-sig-abc123==",
  },
};

export const sampleFleetCallbackSingleVehicleParsed = {
  TiraMsg: {
    MotorCoverNoteRefRes: {
      FleetResHdr: {
        ResponseId: "RES-FLT-002",
        RequestId: "REQ-FLT-002",
        FleetId: "FLT-002",
        FleetStatusCode: "TIRA001",
        FleetStatusDesc: "Processed",
      },
      FleetResDtl: {
        FleetEntry: "1",
        CoverNoteNumber: "SPCPLBA000001",
        CoverNoteReferenceNumber: "CN-FLT-2025-001",
        StickerNumber: "STK-FLT-2025-001",
        ResponseStatusCode: "TIRA001",
        ResponseStatusDesc: "Successful",
      },
    },
    MsgSignature: "fleet-sig-single==",
  },
};

export const validFleetDetailEntry: FleetDetailEntry = {
  fleet_entry: 1,
  covernote_number: "SPCPLBA000001",
  covernote_desc: "Private Vehicles",
  operative_clause: "Comprehensive",
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

export const validFleetPayload: MotorFleetCoverNotePayload = {
  request_id: "LABEDAN-FLEET-1234567890",
  callback_url: "https://example.com/callback",
  insurer_company_code: "ICC103",
  covernote_type: "1",
  fleet_id: "FLT-001",
  fleet_type: "1",
  fleet_size: 2,
  sales_point_code: "SP719",
  covernote_start_date: "2025-05-31T21:00:00Z",
  covernote_end_date: "2026-05-31T21:00:00Z",
  payment_mode: "3",
  total_premium_excluding_tax: 1050000,
  total_premium_including_tax: 1239000,
  commission_paid: 131250,
  commission_rate: 0.125,
  officer_name: "Johnson Abraham",
  officer_title: "Manager",
  product_code: "SP014001000000",
  policy_holders: [
    {
      policyholder_name: "FLEET OWNER",
      policyholder_birthdate: "1984-06-19",
      policyholder_type: "2",
      policyholder_id_number: "19840619566676776857",
      policyholder_id_type: "6",
      gender: "M",
      country_code: "TZA",
      region: "Dar es Salaam",
      district: "Ilala",
      street: "Kariakoo",
      phone_number: "255712345678",
      postal_address: "DSM",
    },
  ],
  fleet_details: [
    { ...validFleetDetailEntry },
    {
      ...validFleetDetailEntry,
      fleet_entry: 2,
      covernote_number: "SPCPLBA000002",
      motor_details: {
        ...validFleetDetailEntry.motor_details,
        registration_number: "T456DEF",
        chassis_number: "9876543210",
        make: "Nissan",
        model: "X-Trail",
        model_number: "2015",
      },
    },
  ],
};

// --- Reinsurance Fixtures ---

export const validReinsuranceDetail: ReinsuranceDetail = {
  participant_code: "RE001",
  participant_type: "1",
  reinsurance_form: "3",
  reinsurance_type: "1",
  re_broker_code: "BRK001",
  brokerage_commission: 5000,
  reinsurance_commission: 10000,
  premium_share: 250000,
  participation_date: "2025-05-31T21:00:00Z",
};

export const validReinsurancePayload: ReinsurancePayload = {
  request_id: "NIC22424232355",
  callback_url: "https://example.com/reinsurance/callback",
  insurer_company_code: "ICC103",
  covernote_reference_number: "CN-2025-001",
  premium_including_tax: 619500,
  currency_code: "TZS",
  exchange_rate: 1.0,
  authorizing_officer_name: "Johnson Abraham",
  authorizing_officer_title: "Manager",
  reinsurance_category: "1",
  reinsurance_details: [
    { ...validReinsuranceDetail },
    {
      ...validReinsuranceDetail,
      participant_code: "RE002",
      participant_type: "4",
      re_broker_code: "BRK002",
      premium_share: 150000,
    },
  ],
};

export const sampleReinsuranceCallbackXml = `<TiraMsg>
  <ReinsuranceRes>
    <ResponseId>TIRA22424232355</ResponseId>
    <RequestId>NIC22424232355</RequestId>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </ReinsuranceRes>
  <MsgSignature>reinsurance-sig-abc123==</MsgSignature>
</TiraMsg>`;

export const sampleReinsuranceCallbackParsed = {
  TiraMsg: {
    ReinsuranceRes: {
      ResponseId: "TIRA22424232355",
      RequestId: "NIC22424232355",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "reinsurance-sig-abc123==",
  },
};

// --- Policy Fixtures ---

export const validPolicyDetail: PolicyDetail = {
  policy_number: "CV224223255",
  policy_operative_clause: "Full comprehensive coverage for all listed items",
  special_conditions: "Coverage applies only within Tanzania mainland",
  exclusions: "War and terrorism excluded",
  applied_cover_notes: ["4242424", "2323235"],
};

export const validPolicyPayload: PolicyPayload = {
  request_id: "NIC22424232355",
  callback_url: "https://example.com/policy/callback",
  insurer_company_code: "ICC103",
  policy_detail: { ...validPolicyDetail },
};

export const samplePolicyCallbackXml = `<TiraMsg>
  <PolicyRes>
    <ResponseId>TIRA22424232355</ResponseId>
    <RequestId>NIC22424232355</RequestId>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </PolicyRes>
  <MsgSignature>policy-sig-abc123==</MsgSignature>
</TiraMsg>`;

export const samplePolicyCallbackParsed = {
  TiraMsg: {
    PolicyRes: {
      ResponseId: "TIRA22424232355",
      RequestId: "NIC22424232355",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "policy-sig-abc123==",
  },
};

// --- Claim Notification Fixtures ---

export const validClaimNotificationPayload: ClaimNotificationPayload = {
  request_id: "NIC22424232355",
  callback_url: "https://example.com/claim-notification/callback",
  insurer_company_code: "IC001",
  claim_notification_number: "NIC00004",
  covernote_reference_number: "3252-5252",
  claim_report_date: "2020-09-15T13:55:22",
  claim_form_dully_filled: "Y",
  loss_date: "2020-09-15T13:55:22",
  loss_nature: "Fire and Allied Perils",
  loss_type: "Bodily Injury",
  loss_location: "Morogoro",
  officer_name: "John Doe",
  officer_title: "Underwriter",
};

export const sampleClaimNotificationCallbackXml = `<TiraMsg>
  <ClaimNotificationRefRes>
    <ResponseId>TIRA22424232355</ResponseId>
    <RequestId>NIC22424232355</RequestId>
    <ClaimReferenceNumber>3325253254</ClaimReferenceNumber>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </ClaimNotificationRefRes>
  <MsgSignature>claim-notif-sig-abc123==</MsgSignature>
</TiraMsg>`;

export const sampleClaimNotificationCallbackParsed = {
  TiraMsg: {
    ClaimNotificationRefRes: {
      ResponseId: "TIRA22424232355",
      RequestId: "NIC22424232355",
      ClaimReferenceNumber: "3325253254",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "claim-notif-sig-abc123==",
  },
};

// --- Cover Note Verification Fixtures ---

export const validCoverNoteVerificationPayload: CoverNoteVerificationPayload = {
  request_id: "NIC22424232355",
  covernote_reference_number: "4242424",
};

export const validCoverNoteVerificationPayloadFull: CoverNoteVerificationPayload = {
  request_id: "NIC22424232355",
  covernote_reference_number: "4242424",
  sticker_number: "1313-1414-124124",
  motor_registration_number: "T233SQA",
  motor_chassis_number: "4353646",
};

// --- Claim Intimation Fixtures ---

export const validClaimIntimationPayload: ClaimIntimationPayload = {
  request_id: "AB3232532523344",
  callback_url: "https://nic.co.tz/api/CoverNoteref/response",
  insurer_company_code: "IC100",
  claim_intimation_number: "322WQ25234234",
  claim_reference_number: "10020-25400-07720",
  covernote_reference_number: "10020-25400-07720",
  claim_intimation_date: "2020-09-10T13:55:22",
  currency_code: "USD",
  exchange_rate: 2000.0,
  claim_estimated_amount: 2000000.0,
  claim_reserve_amount: 1000000.0,
  claim_reserve_method: "Chain Ladder",
  loss_assessment_option: "1",
  assessor_name: "Baraka Kiswigu",
  assessor_id_number: "124214114",
  assessor_id_type: "1",
  claimants: [
    {
      claimant_name: "Augustino Aidan Mwageni",
      claimant_birth_date: "1920-02-05",
      claimant_category: "2",
      claimant_type: "1",
      claimant_id_number: "24241241",
      claimant_id_type: "1",
      country_code: "TZA",
      region: "Dar es Salaam",
      district: "Ilala",
      claimant_phone_number: "255713525539",
    },
    {
      claimant_name: "KISWIGU Company Ltd",
      claimant_birth_date: "1950-02-05",
      claimant_category: "2",
      claimant_type: "2",
      claimant_id_number: "3452525235525",
      claimant_id_type: "3",
      country_code: "TZA",
      region: "Dar es Salaam",
      district: "Ilala",
      claimant_phone_number: "255713525539",
    },
  ],
};

export const sampleClaimIntimationCallbackXml = `<TiraMsg>
  <ClaimIntimationRes>
    <ResponseId>TIRA22424232355</ResponseId>
    <RequestId>NIC22424232355</RequestId>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </ClaimIntimationRes>
  <MsgSignature>claim-intim-sig-abc123==</MsgSignature>
</TiraMsg>`;

export const sampleClaimIntimationCallbackParsed = {
  TiraMsg: {
    ClaimIntimationRes: {
      ResponseId: "TIRA22424232355",
      RequestId: "NIC22424232355",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "claim-intim-sig-abc123==",
  },
};

// --- Claim Assessment Fixtures ---

export const validClaimAssessmentPayload: ClaimAssessmentPayload = {
  request_id: "AB3232532523344",
  callback_url: "https://nic.co.tz/api/CoverNoteref/response",
  insurer_company_code: "IC100",
  claim_assessment_number: "322WQ25234234",
  claim_intimation_number: "35234234",
  claim_reference_number: "10020-25400-07720",
  covernote_reference_number: "10020-25400-07720",
  assessment_received_date: "2020-09-10T13:55:22",
  assessment_report_summary: "rgegerufuiwiuefuiqwguqufi",
  currency_code: "USD",
  exchange_rate: 2000.0,
  assessment_amount: 20000.0,
  approved_claim_amount: 20000.0,
  claim_approval_date: "2020-09-10T13:55:22",
  claim_approval_authority: "CEO",
  is_re_assessment: "Y",
  claimants: [
    {
      claimant_category: "2",
      claimant_type: "1",
      claimant_id_number: "24241241",
      claimant_id_type: "1",
    },
    {
      claimant_category: "2",
      claimant_type: "2",
      claimant_id_number: "3452525235525",
      claimant_id_type: "3",
    },
  ],
};

export const sampleClaimAssessmentCallbackXml = `<TiraMsg>
  <ClaimAssessmentRes>
    <ResponseId>TIRA22424232355</ResponseId>
    <RequestId>NIC22424232355</RequestId>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </ClaimAssessmentRes>
  <MsgSignature>claim-assess-sig-abc123==</MsgSignature>
</TiraMsg>`;

export const sampleClaimAssessmentCallbackParsed = {
  TiraMsg: {
    ClaimAssessmentRes: {
      ResponseId: "TIRA22424232355",
      RequestId: "NIC22424232355",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "claim-assess-sig-abc123==",
  },
};

// --- Discharge Voucher Fixtures ---

export const validDischargeVoucherPayload: DischargeVoucherPayload = {
  request_id: "AB3232532523344",
  callback_url: "https://nic.co.tz/api/CoverNoteref/response",
  insurer_company_code: "IC100",
  discharge_voucher_number: "322WQ25234234",
  claim_assessment_number: "322WQ252323423q4",
  claim_reference_number: "10020-25400-07720",
  covernote_reference_number: "10020-25400-07720",
  discharge_voucher_date: "2020-09-10T13:55:22",
  currency_code: "USD",
  exchange_rate: 2000.0,
  claim_offer_communication_date: "2020-09-10T13:55:22",
  claim_offer_amount: 5000000,
  claimant_response_date: "2020-09-10T13:55:22",
  adjustment_date: "2020-09-10T13:55:22",
  adjustment_reason: "vhrefhrehfohfiwhei",
  adjustment_amount: 1000000.0,
  reconciliation_date: "2020-09-10T13:55:22",
  reconciliation_summary: "vyuergviwfvwiuevuiwvfiubbegwe",
  reconciled_amount: 200000,
  offer_accepted: "N",
  claimants: [
    {
      claimant_category: "2",
      claimant_type: "1",
      claimant_id_number: "24241241",
      claimant_id_type: "1",
    },
    {
      claimant_category: "2",
      claimant_type: "2",
      claimant_id_number: "3452525235525",
      claimant_id_type: "3",
    },
  ],
};

export const sampleDischargeVoucherCallbackXml = `<TiraMsg>
  <DischargeVoucherRes>
    <ResponseId>TIRA22424232355</ResponseId>
    <RequestId>NIC22424232355</RequestId>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </DischargeVoucherRes>
  <MsgSignature>discharge-voucher-sig-abc123==</MsgSignature>
</TiraMsg>`;

export const sampleDischargeVoucherCallbackParsed = {
  TiraMsg: {
    DischargeVoucherRes: {
      ResponseId: "TIRA22424232355",
      RequestId: "NIC22424232355",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "discharge-voucher-sig-abc123==",
  },
};

// --- Claim Payment Fixtures ---

export const validClaimPaymentPayload: ClaimPaymentPayload = {
  request_id: "AB3232532523344",
  callback_url: "https://nic.co.tz/api/CoverNoteref/response",
  insurer_company_code: "IC100",
  claim_payment_number: "322WQ25234234",
  claim_reference_number: "10020-25400-07720",
  claim_intimation_number: "322WQ25234234",
  covernote_reference_number: "10020-25400-07720",
  payment_date: "2020-09-10T13:55:22",
  paid_amount: 20000,
  payment_mode: "1",
  parties_notified: "Y",
  net_premium_earned: 200,
  claim_resulted_litigation: "Y",
  litigation_reason: "gegewgwgwifubweufgweiyfgwiguwf",
  currency_code: "USD",
  exchange_rate: 2000.0,
  claimants: [
    {
      claimant_category: "2",
      claimant_type: "1",
      claimant_id_number: "24241241",
      claimant_id_type: "1",
    },
    {
      claimant_category: "2",
      claimant_type: "2",
      claimant_id_number: "3452525235525",
      claimant_id_type: "3",
    },
  ],
};

export const sampleClaimPaymentCallbackXml = `<TiraMsg>
  <ClaimPaymentRes>
    <ResponseId>TIRA22424232355</ResponseId>
    <RequestId>NIC22424232355</RequestId>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </ClaimPaymentRes>
  <MsgSignature>claim-payment-sig-abc123==</MsgSignature>
</TiraMsg>`;

export const sampleClaimPaymentCallbackParsed = {
  TiraMsg: {
    ClaimPaymentRes: {
      ResponseId: "TIRA22424232355",
      RequestId: "NIC22424232355",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "claim-payment-sig-abc123==",
  },
};

// ── Claim Rejection ──────────────────────────────────────────────────

export const validClaimRejectionPayload: ClaimRejectionPayload = {
  request_id: "AB3232532523344",
  callback_url: "https://nic.co.tz/api/CoverNoteref/response",
  insurer_company_code: "IC100",
  claim_rejection_number: "322WQ25234234",
  claim_reference_number: "10020-25400-07720",
  claim_intimation_number: "322WQ25234234",
  covernote_reference_number: "10020-25400-07720",
  rejection_date: "2020-09-10T13:55:22",
  rejection_reason: "uvygyegrufgiufuwiefiuwieugfiuewfiuehiubfeiuwf",
  claim_resulted_litigation: "Y",
  claim_amount: 20000,
  currency_code: "USD",
  exchange_rate: 2000.0,
  claimants: [
    {
      claimant_category: "2",
      claimant_type: "1",
      claimant_id_number: "24241241",
      claimant_id_type: "1",
    },
    {
      claimant_category: "2",
      claimant_type: "2",
      claimant_id_number: "3452525235525",
      claimant_id_type: "3",
    },
  ],
};

export const sampleClaimRejectionCallbackXml = `<TiraMsg>
  <ClaimRejectionRes>
    <ResponseId>TIRA22424232355</ResponseId>
    <RequestId>NIC22424232355</RequestId>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </ClaimRejectionRes>
  <MsgSignature>claim-rejection-sig-abc123==</MsgSignature>
</TiraMsg>`;

export const sampleClaimRejectionCallbackParsed = {
  TiraMsg: {
    ClaimRejectionRes: {
      ResponseId: "TIRA22424232355",
      RequestId: "NIC22424232355",
      ResponseStatusCode: "TIRA001",
      ResponseStatusDesc: "Successful",
    },
    MsgSignature: "claim-rejection-sig-abc123==",
  },
};
