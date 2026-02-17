export interface CallbackResult<T = Record<string, any>> {
  /** Detected callback type (e.g. 'motor', 'unknown') */
  type: string;
  /** Full parsed XML as JS object */
  body: Record<string, any>;
  /** Typed extracted data */
  extracted: T;
  /** Original XML string */
  raw_xml: string;
  /** Whether the MsgSignature was verified against TIRA's public key. false when verification is not configured or input was pre-parsed. */
  signature_verified: boolean;
}

export interface MotorCallbackResponse {
  /** Response ID from TIRA */
  response_id: string;
  /** The original request ID */
  request_id: string;
  /** Cover note reference number assigned by TIRA */
  cover_note_reference_number?: string;
  /** Sticker number assigned by TIRA */
  sticker_number?: string;
  /** Response status code */
  response_status_code: string;
  /** Response status description */
  response_status_desc: string;
}

export interface NonLifeOtherCallbackResponse {
  /** Response ID from TIRA */
  response_id: string;
  /** The original request ID */
  request_id: string;
  /** Cover note reference number assigned by TIRA */
  cover_note_reference_number?: string;
  /** Response status code */
  response_status_code: string;
  /** Response status description */
  response_status_desc: string;
}

export interface MotorFleetCallbackDetail {
  /** Fleet entry sequence number */
  fleet_entry: number;
  /** Cover note number for this vehicle */
  covernote_number: string;
  /** Cover note reference number assigned by TIRA */
  cover_note_reference_number: string;
  /** Sticker number assigned by TIRA */
  sticker_number: string;
  /** Response status code for this vehicle */
  response_status_code: string;
  /** Response status description for this vehicle */
  response_status_desc: string;
}

export interface MotorFleetCallbackResponse {
  /** Response ID from TIRA */
  response_id: string;
  /** The original request ID */
  request_id: string;
  /** Fleet identifier */
  fleet_id: string;
  /** Fleet-level status code (TIRA001 = all successful) */
  fleet_status_code: string;
  /** Fleet-level status description */
  fleet_status_desc: string;
  /** Per-vehicle results */
  fleet_details: MotorFleetCallbackDetail[];
}

export interface EnabledCallbacks {
  /** Enable motor callback handling */
  motor?: boolean | undefined;
  /** Enable motor fleet callback handling */
  motor_fleet?: boolean | undefined;
  /** Enable non-life other callback handling */
  non_life_other?: boolean | undefined;
}
