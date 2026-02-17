// This file is the main entry point for the Tira Node.js SDK. It exports the main Tira class, error classes, and type definitions for use in other parts of the application or by users of the SDK.
// Copyright (c) LABEDAN IT SOLUTIONS 2026. All rights reserved. See LICENSE file in the project root for license information.

// RESOURCES:
export { Tira } from "./tira.js";
export { TiraError, TiraApiError, TiraValidationError, TiraSignatureError } from "./errors.js";

// REFERENCE DATA:
export { ENDPOINTS } from "./endpoints.js";
export { COUNTRIES } from "./data/countries.js";
export { CURRENCIES } from "./data/currencies.js";
export { REGIONS } from "./data/regions.js";

// TYPES:
export type { TiraConfig } from "./types/config.js";
export type {
  MotorCoverNotePayload,
  MotorCoverNoteResponse,
  MotorVerificationPayload,
  MotorVerificationResponse,
} from "./types/motor.js";
export type {
  NonLifeOtherCoverNotePayload,
  NonLifeOtherCoverNoteResponse,
} from "./types/non-life-other.js";
export type {
  MotorFleetCoverNotePayload,
  MotorFleetCoverNoteResponse,
  FleetDetailEntry,
} from "./types/motor-fleet.js";
export type {
  ReinsurancePayload,
  ReinsuranceResponse,
  ReinsuranceDetail,
} from "./types/reinsurance.js";
export type {
  PolicyPayload,
  PolicyResponse,
  PolicyDetail,
} from "./types/policy.js";
export type {
  ClaimNotificationPayload,
  ClaimNotificationResponse,
} from "./types/claim-notification.js";
export type {
  CoverNoteVerificationPayload,
  CoverNoteVerificationResponse,
} from "./types/covernote-verification.js";
export type {
  ClaimIntimationPayload,
  ClaimIntimationResponse,
  Claimant,
} from "./types/claim-intimation.js";
export type {
  ClaimAssessmentPayload,
  ClaimAssessmentResponse,
  AssessmentClaimant,
} from "./types/claim-assessment.js";
export type {
  DischargeVoucherPayload,
  DischargeVoucherResponse,
} from "./types/discharge-voucher.js";
export type {
  CallbackResult,
  MotorCallbackResponse,
  MotorFleetCallbackResponse,
  MotorFleetCallbackDetail,
  NonLifeOtherCallbackResponse,
  ReinsuranceCallbackResponse,
  PolicyCallbackResponse,
  ClaimNotificationCallbackResponse,
  ClaimIntimationCallbackResponse,
  ClaimAssessmentCallbackResponse,
  DischargeVoucherCallbackResponse,
  EnabledCallbacks,
} from "./types/callback.js";
export type {
  TaxCharged,
  DiscountOffered,
  RisksCovered,
  SubjectMatter,
  CoverNoteAddon,
  PolicyHolder,
  MotorDetails,
  SimpleClaimant,
  CoverNotePayloadBase,
  CoverNoteResponse,
} from "./types/common.js";
