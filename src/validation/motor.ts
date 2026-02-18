import type {
  MotorCoverNotePayload,
  MotorVerificationPayload,
} from "../types/motor.js";
import type { MotorDetails } from "../types/common.js";
import {
  validateRequired,
  validateEnum,
  validatePositiveNumber,
  validateNumber,
} from "./validators.js";
import { validateCoverNotePayload } from "./covernote.js";
import { TiraValidationError } from "../errors.js";

export function validateMotorDetails(
  m: MotorDetails,
  prefix: string,
): void {
  validateEnum(
    m.motor_category,
    {
      "1": "Motor Vehicle",
      "2": "Motor Cycle",
    },
    `${prefix}.motor_category`,
  );
  validateEnum(
    m.motor_type,
    {
      "1": "Registered",
      "2": "In Transit",
    },
    `${prefix}.motor_type`,
  );

  if (m.motor_type === "1") {
    validateRequired(
      m.registration_number,
      `${prefix}.registration_number`,
    );
  }

  validateRequired(m.chassis_number, `${prefix}.chassis_number`);
  validateRequired(m.make, `${prefix}.make`);
  validateRequired(m.model, `${prefix}.model`);
  validateRequired(m.model_number, `${prefix}.model_number`);
  validateRequired(m.body_type, `${prefix}.body_type`);
  validateRequired(m.color, `${prefix}.color`);
  validateRequired(m.engine_number, `${prefix}.engine_number`);
  validateRequired(m.engine_capacity, `${prefix}.engine_capacity`);
  validateRequired(m.fuel_used, `${prefix}.fuel_used`);

  // Axles, axle distance, sitting capacity required for motor vehicles (not motor cycles)
  if (m.motor_category === "1") {
    validateNumber(
      m.number_of_axles as number,
      `${prefix}.number_of_axles`,
    );
    validateNumber(m.axle_distance as number, `${prefix}.axle_distance`);
    validateNumber(
      m.sitting_capacity as number,
      `${prefix}.sitting_capacity`,
    );
  }

  if (
    isNaN(m.year_of_manufacture) ||
    m.year_of_manufacture < 1900 ||
    m.year_of_manufacture > new Date().getFullYear() + 1
  ) {
    throw new TiraValidationError(
      "A valid year of manufacture is required.",
      `${prefix}.year_of_manufacture`,
    );
  }

  validatePositiveNumber(m.tare_weight, `${prefix}.tare_weight`);
  validatePositiveNumber(m.gross_weight, `${prefix}.gross_weight`);
  validateEnum(
    m.motor_usage,
    {
      "1": "Private",
      "2": "Commercial",
    },
    `${prefix}.motor_usage`,
  );
  validateEnum(
    m.owner_category,
    {
      "1": "Sole Proprietor",
      "2": "Corporate",
    },
    `${prefix}.owner_category`,
  );
  validateRequired(m.owner_address, `${prefix}.owner_address`);
}

export function validateMotorCoverNotePayload(
  payload: MotorCoverNotePayload,
): void {
  validateCoverNotePayload(payload);
  validateMotorDetails(payload.motor_details, "motor_details");
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
