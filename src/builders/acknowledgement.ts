import { create } from "xmlbuilder2";

export function buildAckPayload(
  parsedBody: Record<string, any>,
  acknowledgementId: string,
): Record<string, unknown> {
  const tiraMsg = parsedBody.TiraMsg;
  if (!tiraMsg) throw new Error("Missing TiraMsg in callback body");

  const responseTag = Object.keys(tiraMsg).find((k) => k !== "MsgSignature");
  if (!responseTag) throw new Error("No response tag found in TiraMsg");

  const responseData = tiraMsg[responseTag];

  return {
    [responseTag + "Ack"]: {
      AcknowledgementId: acknowledgementId,
      ResponseId: responseData.ResponseId,
      AcknowledgementStatusCode: "TIRA001",
      AcknowledgementStatusDesc: "Successful",
    },
  };
}

export function buildAcknowledgementXml(ackPayload: Record<string, unknown>): string {
  return create({ version: "1.0" })
    .ele(ackPayload)
    .end({ prettyPrint: false, headless: true });
}
