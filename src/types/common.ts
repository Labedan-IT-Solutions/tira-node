export interface TaxCharged {
  /** Tax code. Given by TIRA. Example: VAT-MAINLAND */
  tax_code: string;
  /** Whether tax is exempted. Y-Yes, N-No */
  is_tax_exempted: "Y" | "N";
  /** Tax exemption type. 1-Policy Holder Exempted, 2-Risk Exempted */
  tax_exemption_type?: "1" | "2" | undefined;
  /** Tax exemption reference number */
  tax_exemption_reference?: string | undefined;
  /** Tax rate as a decimal (e.g., 0.18 for 18%) (Max 5 decimal places) */
  tax_rate: number;
  /** Tax amount (Max 2 decimal places) */
  tax_amount: number;
}

export interface DiscountOffered {
  /** Discount type code: 1-Fleet Discount */
  discount_type: "1";
  /** Discount rate (Max 5 decimal places) */
  discount_rate: number;
  /** Discount amount (Max 2 decimal places) */
  discount_amount: number;
}

export interface RisksCovered {
  /** The risk code provided by TIRA. Example: SP014001000001 */
  risk_code: string;
  /** The sum insured amount (Max 2 decimal places) */
  sum_insured: number;
  /** The sum insured equivalent amount (Max 2 decimal places) */
  sum_insured_equivalent: number;
  /** The premium rate (Max 5 decimal places) */
  premium_rate: number;
  /** Premium before discount (Max 2 decimal places) */
  premium_before_discount: number;
  /** Premium after discount (Max 2 decimal places) */
  premium_after_discount: number;
  /** Premium excluding tax equivalent (Max 2 decimal places) */
  premium_excluding_tax_equivalent: number;
  /** Premium including tax (Max 2 decimal places) */
  premium_including_tax: number;
  /** Discounts offered on the policy. Currently only supports fleet discount. */
  discounts_offered?: DiscountOffered[] | undefined;
  /** Taxes charged on the policy. If no taxes, send is_tax_exempted as 'Y' and provide exemption details. */
  taxes_charged: TaxCharged[];
}

export interface SubjectMatter {
  /** Subject matter reference. Provided by the insurer. Example: HSB001 */
  subject_matter_reference: string;
  /** Subject matter description. Example: School Bus */
  subject_matter_desc: string;
}

export interface CoverNoteAddon {
  /** Addon reference. Provided by the insurer. */
  addon_reference: string;
  /** Addon description */
  addon_description: string;
  /** Addon amount (Max 2 decimal places) */
  addon_amount: number;
  /** Addon premium rate (Max 5 decimal places) */
  addon_premium_rate: number;
  /** Premium excluding tax (Max 2 decimal places) */
  premium_excluding_tax: number;
  /** Premium excluding tax equivalent (Max 2 decimal places) */
  premium_excluding_tax_equivalent: number;
  /** Premium including tax (Max 2 decimal places) */
  premium_including_tax: number;
  /** Taxes charged on the addon. If no taxes, send is_tax_exempted as 'Y' and provide exemption details. */
  taxes_charged: TaxCharged[];
}

export interface PolicyHolder {
  /** Policy holder name */
  policyholder_name: string;
  /** Policy holder birth date in ISO format (YYYY-MM-DD) */
  policyholder_birthdate: string;
  /** Policy holder type: 1-Individual, 2-Corporate */
  policyholder_type: "1" | "2";
  /** Policy holder ID type: 1-NIDA, 2-Voters ID Card, 3-Passport, 4-Driving License, 5-Zanzibar ID, 6-TIN, 7-Company Incorporation Certificate Number */
  policyholder_id_type: "1" | "2" | "3" | "4" | "5" | "6" | "7";
  /** Policy holder ID number */
  policyholder_id_number: string;
  /** Gender: M-Male, F-Female */
  gender: "M" | "F";
  /** ISO Country code. Example: KEN, TZA, UGA. Defaults to TZA if not provided. */
  country_code?: string | undefined;
  /** Region code. Provided by TIRA. */
  region: string;
  /** District. Provided by TIRA. */
  district: string;
  /** Street name */
  street: string;
  /** Phone number in the format 2557XXXXXXXX (12 digits) */
  phone_number: string;
  /** Fax number */
  fax_number?: string | undefined;
  /** Postal address */
  postal_address: string;
  /** Email address */
  email_address?: string | undefined;
}

export interface CoverNotePayloadBase {
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
  /** Start date of the cover note (ISO format with Z suffix) */
  covernote_start_date: string | Date;
  /** End date of the cover note (ISO format with Z suffix) */
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
}

export interface CoverNoteResponse {
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

export interface MotorDetails {
  /** Motor category: 1-Motor Vehicle, 2-Motor Cycle */
  motor_category: "1" | "2";
  /** Motor type: 1-Registered, 2-In Transit */
  motor_type: "1" | "2";
  /** Registration number. Required if motor type is Registered. */
  registration_number?: string | undefined;
  /** Chassis number */
  chassis_number: string;
  /** Make */
  make: string;
  /** Model */
  model: string;
  /** Model number */
  model_number: string;
  /** Body type */
  body_type: string;
  /** Color */
  color: string;
  /** Engine number */
  engine_number: string;
  /** Engine capacity */
  engine_capacity: string;
  /** Fuel used */
  fuel_used: string;
  /** Number of axles. Optional for motor cycles. */
  number_of_axles?: number | undefined;
  /** Axle distance. Optional for motor cycles. */
  axle_distance?: number | undefined;
  /** Sitting capacity. Optional for motor cycles. */
  sitting_capacity?: number | undefined;
  /** Year of manufacture */
  year_of_manufacture: number;
  /** Tare weight */
  tare_weight: number;
  /** Gross weight */
  gross_weight: number;
  /** Motor usage: 1-Private, 2-Commercial */
  motor_usage: "1" | "2";
  /** Owner name */
  owner_name: string;
  /** Owner category: 1-Sole Proprietor, 2-Corporate */
  owner_category: "1" | "2";
  /** Owner address */
  owner_address: string;
}
