import { parseStringPromise } from "xml2js";

export interface ParsedCallback {
  body: Record<string, any>;
  responseTag: string;
  responseData: Record<string, any>;
}

export async function parseCallbackXml(input: string | Record<string, any>): Promise<ParsedCallback> {
  const body = typeof input === "string"
    ? await parseStringPromise(input, { explicitArray: false })
    : input;

  const tiraMsg = body?.TiraMsg;
  if (!tiraMsg) {
    throw new Error("Missing TiraMsg in callback body");
  }

  const responseTag = Object.keys(tiraMsg).find((k) => k !== "MsgSignature") ?? "";
  const responseData = responseTag ? tiraMsg[responseTag] : {};

  return { body, responseTag, responseData };
}
