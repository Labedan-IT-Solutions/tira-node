import type {
  CoverNotePayloadBase,
  CoverNoteResponse,
  MotorDetails,
} from "./common.js";

export interface MotorCoverNotePayload extends CoverNotePayloadBase {
  /** Motor details */
  motor_details: MotorDetails;
}

export type MotorCoverNoteResponse = CoverNoteResponse;

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
