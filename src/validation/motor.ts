import type {
  MotorCoverNotePayload,
  MotorVerificationPayload,
} from "../types/motor.js";
import {
  validateRequired,
  validateEnum,
  validatePositiveNumber,
  validateNumber,
} from "./validators.js";
import { validateCoverNotePayload } from "./covernote.js";
import { TiraValidationError } from "../errors.js";

export function validateMotorCoverNotePayload(
  payload: MotorCoverNotePayload,
): void {
  validateCoverNotePayload(payload);

  // --- Motor Details ---
  const m = payload.motor_details;

  validateEnum(
    m.motor_category,
    {
      "1": "Motor Vehicle",
      "2": "Motor Cycle",
    },
    "motor_details.motor_category",
  );
  validateEnum(
    m.motor_type,
    {
      "1": "Registered",
      "2": "In Transit",
    },
    "motor_details.motor_type",
  );

  if (m.motor_type === "1") {
    validateRequired(
      m.registration_number,
      "motor_details.registration_number",
    );
  }

  validateRequired(m.chassis_number, "motor_details.chassis_number");
  validateRequired(m.make, "motor_details.make");
  validateRequired(m.model, "motor_details.model");
  validateRequired(m.model_number, "motor_details.model_number");
  validateRequired(m.body_type, "motor_details.body_type");
  validateRequired(m.color, "motor_details.color");
  validateRequired(m.engine_number, "motor_details.engine_number");
  validateRequired(m.engine_capacity, "motor_details.engine_capacity");
  validateRequired(m.fuel_used, "motor_details.fuel_used");

  // Axles, axle distance, sitting capacity required for motor vehicles (not motor cycles)
  if (m.motor_category === "1") {
    validateNumber(
      m.number_of_axles as number,
      "motor_details.number_of_axles",
    );
    validateNumber(m.axle_distance as number, "motor_details.axle_distance");
    validateNumber(
      m.sitting_capacity as number,
      "motor_details.sitting_capacity",
    );
  }

  if (
    isNaN(m.year_of_manufacture) ||
    m.year_of_manufacture < 1900 ||
    m.year_of_manufacture > new Date().getFullYear() + 1
  ) {
    throw new TiraValidationError(
      "A valid year of manufacture is required.",
      "motor_details.year_of_manufacture",
    );
  }

  validatePositiveNumber(m.tare_weight, "motor_details.tare_weight");
  validatePositiveNumber(m.gross_weight, "motor_details.gross_weight");
  validateEnum(
    m.motor_usage,
    {
      "1": "Private",
      "2": "Commercial",
    },
    "motor_details.motor_usage",
  );
  validateRequired(m.owner_name, "motor_details.owner_name");
  validateEnum(
    m.owner_category,
    {
      "1": "Sole Proprietor",
      "2": "Corporate",
    },
    "motor_details.owner_category",
  );
  validateRequired(m.owner_address, "motor_details.owner_address");
}

export function validateMotorVerificationPayload(
  payload: MotorVerificationPayload,
): void {
  validateRequired(payload.request_id, "request_id");
  validateEnum(
    payload.motor_category,
    {
      "1": "Motor Vehicle",
      "2": "Motor Cycle",
    },
    "motor_category",
  );

  if (!payload.motor_registration_number && !payload.motor_chassis_number) {
    throw new TiraValidationError(
      "Either motor_registration_number or motor_chassis_number must be provided.",
      "motor_registration_number",
    );
  }

  if (payload.motor_registration_number && payload.motor_chassis_number) {
    throw new TiraValidationError(
      "Provide either motor_registration_number or motor_chassis_number, not both.",
      "motor_registration_number",
    );
  }
}
