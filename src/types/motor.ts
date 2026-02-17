import type {
  RisksCovered,
  SubjectMatter,
  CoverNoteAddon,
  PolicyHolder,
  MotorDetails,
} from "./common.js";

export interface MotorCoverNotePayload {
  /** Unique request identifier */
  request_id: string;
  /** Callback URL for responses (must be HTTPS) */
  callback_url: string;
  /** Insurer company code */
  insurer_company_code: string;
  /** Type of cover note: 1-New, 2-Renewal, 3-Endorsement */
  covernote_type: "1" | "2" | "3";
  /** Cover note number given by the insurer */
  covernote_number?: string | undefined;
  /** Previous cover note reference number (for renewals/endorsements) */
  previous_covernote_reference_number?: string | undefined;
  /** Sales point code - given by TIRA */
  sales_point_code: string;
  /** Start date of the cover note (ISO format or Date object) */
  covernote_start_date: string | Date;
  /** End date of the cover note (ISO format or Date object) */
  covernote_end_date: string | Date;
  /** Description of the cover note */
  covernote_desc: string;
  /** Operative clause text */
  operative_clause: string;
  /** Payment mode: 1-Cash, 2-Cheque, 3-EFT */
  payment_mode: "1" | "2" | "3";
  /** ISO Currency code (e.g., TZS, USD). Defaults to TZS. */
  currency_code?: string | undefined;
  /** Exchange rate to TZS. Defaults to 1.0 if TZS. */
  exchange_rate?: number | undefined;
  /** Total premium amount excluding tax */
  total_premium_excluding_tax: number;
  /** Total premium amount including tax */
  total_premium_including_tax: number;
  /** Commission amount paid - Mandatory for intermediaries */
  commission_paid?: number | undefined;
  /** Commission rate percentage - Mandatory for intermediaries (Max 5 decimal places) */
  commission_rate?: number | undefined;
  /** Name of the insurance officer processing the cover note */
  officer_name: string;
  /** Title of the insurance officer */
  officer_title: string;
  /** Product code. E.g. SP014001000000 for MOTOR PRIVATE VEHICLE */
  product_code: string;
  /** Endorsement type: 1-Increasing Premium, 2-Decreasing Premium, 3-Cover Details Changed, 4-Cancellation. Mandatory for endorsements. */
  endorsement_type?: "1" | "2" | "3" | "4" | undefined;
  /** Reason for endorsement */
  endorsement_reason?: string | undefined;
  /** Premium amount earned from endorsement */
  endorsement_premium_earned?: number | undefined;
  /** List of risks covered. At least one required. */
  risks_covered: RisksCovered[];
  /** List of subject matters covered. At least one required. */
  subject_matters_covered: SubjectMatter[];
  /** List of cover note addons. Optional. */
  covernote_addons?: CoverNoteAddon[] | undefined;
  /** List of policy holders. At least one required. */
  policy_holders: PolicyHolder[];
  /** Motor details */
  motor_details: MotorDetails;
}

export interface MotorCoverNoteResponse {
  /** Acknowledgement ID from TIRA */
  acknowledgement_id: string;
  /** The original request ID */
  request_id: string;
  /** TIRA status code */
  tira_status_code: string;
  /** TIRA status description */
  tira_status_desc: string;
  /** Whether this response requires acknowledgement */
  requires_acknowledgement: boolean;
  /** Raw acknowledgement payload for sending back to TIRA */
  acknowledgement_payload: Record<string, unknown>;
}

export interface MotorVerificationPayload {
  /** Unique request identifier */
  request_id: string;
  /** Motor category: 1-Motor Vehicle, 2-Motor Cycle. Defaults to "1". */
  motor_category: "1" | "2";
  /** Motor registration number. Provide this OR motor_chassis_number, not both. */
  motor_registration_number?: string | undefined;
  /** Motor chassis number. Provide this OR motor_registration_number, not both. */
  motor_chassis_number?: string | undefined;
}

export interface MotorVerificationResponse {
  /** Response ID from TIRA */
  response_id: string;
  /** The original request ID */
  request_id: string;
  /** TIRA status code (TIRA001 = success) */
  tira_status_code: string;
  /** TIRA status description */
  tira_status_desc: string;
  /** Motor details from TIRA — only present on successful verification (TIRA001) */
  data?: Record<string, any> | undefined;
}
