import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { PolicyPayload } from "../types/policy.js";

export function buildPolicyXml(
  payload: PolicyPayload,
  config: TiraConfig,
): string {
  const d = payload.policy_detail;

  return create({ version: "1.0" })
    .ele({
      PolicyReq: {
        PolicyHdr: {
          RequestId: payload.request_id,
          CompanyCode: config.client_code,
          SystemCode: config.system_code,
          CallBackUrl: payload.callback_url,
          InsurerCompanyCode: payload.insurer_company_code,
        },
        PolicyDtl: {
          PolicyNumber: d.policy_number,
          PolicyOperativeClause: d.policy_operative_clause,
          SpecialConditions: d.special_conditions,
          Exclusions: d.exclusions ?? "",
          AppliedCoverNotes: {
            CoverNoteReferenceNumber: d.applied_cover_notes,
          },
        },
      },
    })
    .end({ prettyPrint: false, headless: true });
}
