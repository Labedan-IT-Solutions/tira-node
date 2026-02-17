import { create } from "xmlbuilder2";
import type { TiraConfig } from "../types/config.js";
import type { NonLifeOtherCoverNotePayload } from "../types/non-life-other.js";
import { buildCoverNoteHdr, buildCoverNoteDtl } from "./covernote.js";

export function buildNonLifeOtherCoverNoteXml(
  payload: NonLifeOtherCoverNotePayload,
  config: TiraConfig,
): string {
  return create({ version: "1.0" })
    .ele({
      CoverNoteRefReq: {
        CoverNoteHdr: buildCoverNoteHdr(payload, config),
        CoverNoteDtl: buildCoverNoteDtl(payload),
      },
    })
    .end({ prettyPrint: false, headless: true });
}
