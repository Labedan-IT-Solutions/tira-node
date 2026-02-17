// This file is the main entry point for the Tira Node.js SDK. It exports the main Tira class, error classes, and type definitions for use in other parts of the application or by users of the SDK.
// Copyright (c) LABEDAN IT SOLUTIONS 2026. All rights reserved. See LICENSE file in the project root for license information.

// RESOURCES:
export { Tira } from "./tira.js";
export { TiraError, TiraApiError, TiraValidationError } from "./errors.js";
export { ENDPOINTS } from "./endpoints.js";

// TYPES:
export type { TiraConfig } from "./types/config.js";
export type {
  MotorCoverNotePayload,
  MotorCoverNoteResponse,
} from "./types/motor.js";
export type {
  TaxCharged,
  DiscountOffered,
  RisksCovered,
  SubjectMatter,
  CoverNoteAddon,
  PolicyHolder,
  MotorDetails,
} from "./types/common.js";
