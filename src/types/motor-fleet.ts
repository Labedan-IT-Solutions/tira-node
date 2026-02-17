import type {
  CoverNotePayloadBase,
  CoverNoteResponse,
  RisksCovered,
  SubjectMatter,
  CoverNoteAddon,
  MotorDetails,
} from "./common.js";

export interface FleetDetailEntry {
  /** Fleet entry sequence number (1, 2, 3, etc.) */
  fleet_entry: number;
  /** Cover note number for this vehicle */
  covernote_number: string;
  /** Previous cover note reference number (for renewals/endorsements) */
  previous_covernote_reference_number?: string | undefined;
  /** Description of the cover note for this vehicle */
  covernote_desc: string;
  /** Operative clause text */
  operative_clause: string;
  /** Endorsement type: 1-Increasing Premium, 2-Decreasing Premium, 3-Cover Details Changed, 4-Cancellation */
  endorsement_type?: "1" | "2" | "3" | "4" | undefined;
  /** Reason for endorsement */
  endorsement_reason?: string | undefined;
  /** Premium amount earned from endorsement */
  endorsement_premium_earned?: number | undefined;
  /** List of risks covered for this vehicle. At least one required. */
  risks_covered: RisksCovered[];
  /** List of subject matters covered for this vehicle. At least one required. */
  subject_matters_covered: SubjectMatter[];
  /** List of cover note addons for this vehicle. Optional. */
  covernote_addons?: CoverNoteAddon[] | undefined;
  /** Motor details for this vehicle */
  motor_details: MotorDetails;
}

export interface MotorFleetCoverNotePayload extends Pick<CoverNotePayloadBase,
  'request_id' | 'callback_url' | 'insurer_company_code' | 'covernote_type' |
  'sales_point_code' | 'covernote_start_date' | 'covernote_end_date' |
  'payment_mode' | 'currency_code' | 'exchange_rate' |
  'total_premium_excluding_tax' | 'total_premium_including_tax' |
  'commission_paid' | 'commission_rate' |
  'officer_name' | 'officer_title' | 'product_code' | 'policy_holders'
> {
  /** Fleet identifier */
  fleet_id: string;
  /** Fleet type: 1-New fleet, 2-Additional vehicles to existing fleet */
  fleet_type: '1' | '2';
  /** Total number of vehicles in the fleet */
  fleet_size: number;
  /** Number of vehicles with comprehensive insurance */
  comprehensive_insured?: number | undefined;
  /** Array of fleet detail entries — one per vehicle in the fleet */
  fleet_details: FleetDetailEntry[];
}

export type MotorFleetCoverNoteResponse = CoverNoteResponse;
