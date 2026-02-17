export const ENDPOINTS = {
  // Motor
  covernote_motor: "/ecovernote/api/covernote/non-life/motor/v2/request",
  covernote_motor_fleet: "/ecovernote/api/covernote/non-life/motor-fleet/v2/request",
  motor_verification: "/dispatch/api/motor/verification/v1/request",

  // Non-life other
  covernote_other: "/ecovernote/api/covernote/non-life/other/v2/request",

  // Short/long term (same endpoint as other)
  shortterm_covernote: "/ecovernote/api/covernote/non-life/other/v2/request",
  longterm_covernote: "/ecovernote/api/covernote/non-life/other/v2/request",

  // Cover note & policy
  covernote_verification: "/ecovernote/api/covernote/verification/v2/request",
  policy_submission: "/ecovernote/api/policy/v1/request",

  // Reinsurance
  reinsurance_submission: "/ecovernote/api/reinsurance/v1/request",

  // Claims
  claim_notification: "/eclaim/api/claim/claim-notification/v1/request",
  claim_intimation: "/eclaim/api/claim/claim-intimation/v1/request",
  claim_assessment: "/eclaim/api/claim/claim-assessment/v1/request",
  discharge_voucher: "/eclaim/api/claim/claim-dischargevoucher/v1/request",
  claim_payment: "/eclaim/api/claim/claim-payment/v1/request",
  claim_rejection: "/eclaim/api/claim/claim-rejection/v1/request",
} as const;
