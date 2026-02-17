import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type {
  MotorCoverNotePayload,
  MotorVerificationPayload,
} from "../types/motor.js";
import { buildCoverNoteHdr, buildCoverNoteDtl } from "./covernote.js";

export function buildMotorCoverNoteXml(
  payload: MotorCoverNotePayload,
  config: TiraConfig,
): string {
  const m = payload.motor_details;

  return create({ version: "1.0" })
    .ele({
      MotorCoverNoteRefReq: {
        CoverNoteHdr: buildCoverNoteHdr(payload, config),
        CoverNoteDtl: {
          ...buildCoverNoteDtl(payload),
          MotorDtl: {
            MotorCategory: m.motor_category,
            MotorType: m.motor_type,
            RegistrationNumber: m.registration_number ?? "",
            ChassisNumber: m.chassis_number,
            Make: m.make,
            Model: m.model,
            ModelNumber: m.model_number,
            BodyType: m.body_type,
            Color: m.color,
            EngineNumber: m.engine_number,
            EngineCapacity: m.engine_capacity,
            FuelUsed: m.fuel_used,
            NumberOfAxles: m.number_of_axles ?? "",
            AxleDistance: m.axle_distance ?? "0",
            SittingCapacity: m.sitting_capacity ?? "",
            YearOfManufacture: m.year_of_manufacture,
            TareWeight: m.tare_weight,
            GrossWeight: m.gross_weight,
            MotorUsage: m.motor_usage,
            OwnerName: m.owner_name,
            OwnerCategory: m.owner_category,
            OwnerAddress: m.owner_address,
          },
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}

export function buildMotorVerificationXml(
  payload: MotorVerificationPayload,
  config: TiraConfig,
): string {
  return create({ version: "1.0" })
    .ele({
      MotorVerificationReq: {
        VerificationHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
        },
        VerificationDtl: {
          MotorCategory: payload.motor_category,
          MotorRegistrationNumber: payload.motor_registration_number ?? "",
          MotorChassisNumber: payload.motor_chassis_number ?? "",
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
