import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fs and signing internals
vi.mock("node:fs", () => ({
  readFileSync: vi.fn(() => Buffer.from("mock-pfx-content")),
}));

vi.mock("../signing.js", () => ({
  extractSignedContentAndSignature: vi.fn((rawXml: string) => {
    const sigMatch = rawXml.match(/<MsgSignature>([\s\S]*?)<\/MsgSignature>/);
    const tiraMsgStart = rawXml.indexOf("<TiraMsg>");
    const msgSigStart = rawXml.indexOf("<MsgSignature>");

    if (!sigMatch?.[1] || tiraMsgStart === -1 || msgSigStart === -1) return null;

    const contentStart = tiraMsgStart + "<TiraMsg>".length;
    const contentXml = rawXml.substring(contentStart, msgSigStart).trim();

    return { contentXml, base64Signature: sigMatch[1].trim() };
  }),
  verifySignature: vi.fn(() => true),
  signContent: vi.fn(() => "mock-base64-signature"),
  wrapTiraMsg: vi.fn(
    (content: string, sig: string) =>
      `<TiraMsg>\n${content}\n<MsgSignature>${sig}</MsgSignature>\n</TiraMsg>`,
  ),
}));

import { extractSignedContentAndSignature, verifySignature } from "../signing.js";
import { verifyCallbackSignature } from "../callbacks/handler.js";
import { TiraSignatureError } from "../errors.js";

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(verifySignature).mockReturnValue(true);
  vi.mocked(extractSignedContentAndSignature).mockImplementation((rawXml: string) => {
    const sigMatch = rawXml.match(/<MsgSignature>([\s\S]*?)<\/MsgSignature>/);
    const tiraMsgStart = rawXml.indexOf("<TiraMsg>");
    const msgSigStart = rawXml.indexOf("<MsgSignature>");

    if (!sigMatch?.[1] || tiraMsgStart === -1 || msgSigStart === -1) return null;

    const contentStart = tiraMsgStart + "<TiraMsg>".length;
    const contentXml = rawXml.substring(contentStart, msgSigStart).trim();

    return { contentXml, base64Signature: sigMatch[1].trim() };
  });
});

const sampleXml = `<TiraMsg>
  <MotorCoverNoteRefRes>
    <ResponseId>RES-001</ResponseId>
    <RequestId>REQ-001</RequestId>
  </MotorCoverNoteRefRes>
  <MsgSignature>abc123signature==</MsgSignature>
</TiraMsg>`;

describe("extractSignedContentAndSignature", () => {
  it("extracts content and signature from well-formed TiraMsg", () => {
    const result = extractSignedContentAndSignature(sampleXml);
    expect(result).not.toBeNull();
    expect(result!.contentXml).toContain("<MotorCoverNoteRefRes>");
    expect(result!.base64Signature).toBe("abc123signature==");
  });

  it("returns null for XML without MsgSignature", () => {
    const result = extractSignedContentAndSignature("<TiraMsg><SomeTag/></TiraMsg>");
    expect(result).toBeNull();
  });

  it("returns null for XML without TiraMsg", () => {
    const result = extractSignedContentAndSignature(
      "<Other><MsgSignature>sig</MsgSignature></Other>",
    );
    expect(result).toBeNull();
  });

  it("handles multiline content XML", () => {
    const multilineXml = `<TiraMsg>
  <CoverNoteRefRes>
    <ResponseId>RES-001</ResponseId>
    <RequestId>REQ-001</RequestId>
    <CoverNoteReferenceNumber>CN-001</CoverNoteReferenceNumber>
    <ResponseStatusCode>TIRA001</ResponseStatusCode>
    <ResponseStatusDesc>Successful</ResponseStatusDesc>
  </CoverNoteRefRes>
  <MsgSignature>xyz789==</MsgSignature>
</TiraMsg>`;
    const result = extractSignedContentAndSignature(multilineXml);
    expect(result).not.toBeNull();
    expect(result!.contentXml).toContain("<CoverNoteRefRes>");
    expect(result!.contentXml).toContain("</CoverNoteRefRes>");
    expect(result!.base64Signature).toBe("xyz789==");
  });
});

describe("verifyCallbackSignature", () => {
  it("returns false when verify_signatures is false", () => {
    const result = verifyCallbackSignature(sampleXml, false, "./certs/tiramispublic.pfx", "password");
    expect(result).toBe(false);
    expect(verifySignature).not.toHaveBeenCalled();
  });

  it("returns false when input is a pre-parsed object", () => {
    const result = verifyCallbackSignature(
      { TiraMsg: { SomeTag: {} } },
      true,
      "./certs/tiramispublic.pfx",
      "password",
    );
    expect(result).toBe(false);
    expect(verifySignature).not.toHaveBeenCalled();
  });

  it("returns true when signature is valid", () => {
    const result = verifyCallbackSignature(
      sampleXml,
      true,
      "./certs/tiramispublic.pfx",
      "password",
    );
    expect(result).toBe(true);
    expect(verifySignature).toHaveBeenCalledWith(
      expect.stringContaining("<MotorCoverNoteRefRes>"),
      "abc123signature==",
      "./certs/tiramispublic.pfx",
      "password",
    );
  });

  it("throws TiraSignatureError when signature is invalid", () => {
    vi.mocked(verifySignature).mockReturnValue(false);
    expect(() =>
      verifyCallbackSignature(
        sampleXml,
        true,
        "./certs/tiramispublic.pfx",
        "password",
      ),
    ).toThrow(TiraSignatureError);
    expect(() =>
      verifyCallbackSignature(
        sampleXml,
        true,
        "./certs/tiramispublic.pfx",
        "password",
      ),
    ).toThrow("signature does not match content");
  });

  it("throws TiraSignatureError when extraction fails", () => {
    vi.mocked(extractSignedContentAndSignature).mockReturnValue(null);
    expect(() =>
      verifyCallbackSignature(
        "<invalid>xml</invalid>",
        true,
        "./certs/tiramispublic.pfx",
        "password",
      ),
    ).toThrow(TiraSignatureError);
    expect(() =>
      verifyCallbackSignature(
        "<invalid>xml</invalid>",
        true,
        "./certs/tiramispublic.pfx",
        "password",
      ),
    ).toThrow("Could not extract signature");
  });
});
