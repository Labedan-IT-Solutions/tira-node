import { parseStringPromise } from "xml2js";
import { extractSignedContentAndSignature, verifySignature } from "../signing.js";
import { TiraSignatureError } from "../errors.js";

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

export function verifyCallbackSignature(
  input: string | Record<string, any>,
  shouldVerify: boolean,
  tiraPublicPfxPath: string,
  tiraPublicPfxPassphrase: string,
): boolean {
  if (!shouldVerify) {
    return false;
  }

  if (typeof input !== "string") {
    return false;
  }

  const parts = extractSignedContentAndSignature(input);
  if (!parts) {
    throw new TiraSignatureError("Could not extract signature from TiraMsg XML");
  }

  const isValid = verifySignature(
    parts.contentXml,
    parts.base64Signature,
    tiraPublicPfxPath,
    tiraPublicPfxPassphrase,
  );

  if (!isValid) {
    throw new TiraSignatureError("Callback signature verification failed: signature does not match content");
  }

  return true;
}
