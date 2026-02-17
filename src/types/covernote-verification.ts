export interface CoverNoteVerificationPayload {
  /** Unique request identifier */
  request_id: string;
  /** Cover note reference number — mandatory */
  covernote_reference_number: string;
  /** Motor sticker number */
  sticker_number?: string | undefined;
  /** Motor registration number */
  motor_registration_number?: string | undefined;
  /** Motor chassis number */
  motor_chassis_number?: string | undefined;
}

export interface CoverNoteVerificationResponse {
  /** Response ID from TIRA */
  response_id: string;
  /** The original request ID */
  request_id: string;
  /** TIRA status code (TIRA001 = success) */
  tira_status_code: string;
  /** TIRA status description */
  tira_status_desc: string;
  /** Cover note details from TIRA — only present on successful verification (TIRA001) */
  data?: Record<string, any> | undefined;
}
