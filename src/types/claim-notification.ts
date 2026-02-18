import type { CoverNoteResponse } from "./common.js";

export interface ClaimNotificationPayload {
  /** Unique request identifier */
  request_id: string;
  /** Callback URL for responses */
  callback_url: string;
  /** Insurer company code */
  insurer_company_code: string;
  /** Claim notification number as per insurer. String(50) */
  claim_notification_number: string;
  /** Cover note reference number. String(50) */
  covernote_reference_number: string;
  /** Claim report date and time. YYYY-MM-DD'T'HH:MM:SS format */
  claim_report_date: string | Date;
  /** Whether filled claim form is submitted. Y-Yes, N-No */
  claim_form_duly_filled: "Y" | "N";
  /** Loss date and time. YYYY-MM-DD'T'HH:MM:SS format */
  loss_date: string | Date;
  /** Nature of loss. String(100) */
  loss_nature: string;
  /** Type of loss. String(100) */
  loss_type: string;
  /** Location of loss. String(100) */
  loss_location: string;
  /** Name of authorizing officer. String(100) */
  officer_name: string;
  /** Title of authorizing officer. String(100) */
  officer_title: string;
}

export type ClaimNotificationResponse = CoverNoteResponse;
