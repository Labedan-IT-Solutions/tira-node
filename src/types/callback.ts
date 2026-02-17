export interface CallbackResult<T = Record<string, any>> {
  /** Detected callback type (e.g. 'motor', 'unknown') */
  type: string;
  /** Full parsed XML as JS object */
  body: Record<string, any>;
  /** Typed extracted data */
  extracted: T;
  /** Original XML string */
  raw_xml: string;
}

export interface MotorCallbackResponse {
  /** Response ID from TIRA */
  response_id: string;
  /** The original request ID */
  request_id: string;
  /** Cover note reference number assigned by TIRA */
  cover_note_reference_number: string;
  /** Sticker number assigned by TIRA */
  sticker_number: string;
  /** Response status code */
  response_status_code: string;
  /** Response status description */
  response_status_desc: string;
}

export interface EnabledCallbacks {
  /** Enable motor callback handling */
  motor?: boolean | undefined;
}
