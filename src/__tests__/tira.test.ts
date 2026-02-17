import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fs before importing Tira — TiraClient reads certs in constructor
vi.mock("node:fs", () => ({
  readFileSync: vi.fn(() => Buffer.from("mock-cert-content")),
}));

// Mock https — TiraClient creates an Agent in constructor
vi.mock("node:https", () => ({
  Agent: vi.fn(),
  request: vi.fn(),
}));

// Mock signing — needs real PFX file
vi.mock("../signing.js", () => ({
  signContent: vi.fn(() => "mock-base64-signature"),
  wrapTiraMsg: vi.fn(
    (content: string, sig: string) =>
      `<TiraMsg>\n${content}\n<MsgSignature>${sig}</MsgSignature>\n</TiraMsg>`,
  ),
  extractSignedContentAndSignature: vi.fn((rawXml: string) => ({
    contentXml: "mock-content",
    base64Signature: "abc123signature==",
  })),
  verifySignature: vi.fn(() => true),
}));

import { Tira } from "../tira.js";
import { signContent, wrapTiraMsg, verifySignature } from "../signing.js";
import type { TiraConfig } from "../types/config.js";
import {
  mockTiraConfig,
  sampleMotorCallbackXml,
  sampleMotorCallbackParsed,
  sampleMotorCallbackErrorParsed,
  sampleNonLifeOtherCallbackXml,
  sampleNonLifeOtherCallbackParsed,
  sampleFleetCallbackParsed,
  sampleFleetCallbackSingleVehicleParsed,
  sampleFleetCallbackXml,
  sampleReinsuranceCallbackXml,
  sampleReinsuranceCallbackParsed,
  samplePolicyCallbackXml,
  samplePolicyCallbackParsed,
  sampleClaimNotificationCallbackXml,
  sampleClaimNotificationCallbackParsed,
} from "./fixtures.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Tira constructor", () => {
  it("creates instance with all required config fields", () => {
    const tira = new Tira(mockTiraConfig);
    expect(tira.motor).toBeDefined();
  });

  it("creates instance with nonLifeOther resource accessible", () => {
    const tira = new Tira(mockTiraConfig);
    expect(tira.nonLifeOther).toBeDefined();
  });

  it("creates instance with motorFleet resource accessible", () => {
    const tira = new Tira(mockTiraConfig);
    expect(tira.motorFleet).toBeDefined();
  });

  it("creates instance with reinsurance resource accessible", () => {
    const tira = new Tira(mockTiraConfig);
    expect(tira.reinsurance).toBeDefined();
  });

  it("creates instance with policy resource accessible", () => {
    const tira = new Tira(mockTiraConfig);
    expect(tira.policy).toBeDefined();
  });

  const requiredFields: (keyof TiraConfig)[] = [
    "client_code",
    "client_key",
    "system_code",
    "transacting_company_code",
    "base_url",
    "client_cert_path",
    "client_key_path",
    "ca_cert_path",
    "pfx_path",
    "pfx_passphrase",
  ];

  for (const field of requiredFields) {
    it(`throws when ${field} is missing`, () => {
      const config = { ...mockTiraConfig, [field]: "" };
      expect(() => new Tira(config)).toThrow(`Tira: ${field} is required`);
    });
  }
});

describe("Tira.handleCallback", () => {
  it("returns motor callback result when motor is enabled", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });
    const result = await tira.handleCallback(sampleMotorCallbackParsed);

    expect(result.type).toBe("motor");
    expect(result.extracted).toHaveProperty("response_id", "RES-001");
    expect(result.extracted).toHaveProperty("request_id", "REQ-001");
    expect(result.extracted).toHaveProperty(
      "covernote_reference_number",
      "CN-2025-001",
    );
    expect(result.extracted).toHaveProperty("sticker_number", "STK-2025-001");
    expect(result.extracted).toHaveProperty("response_status_code", "TIRA001");
    expect(result.extracted).toHaveProperty(
      "response_status_desc",
      "Successful",
    );
  });

  it("returns non_life_other callback result when non_life_other is enabled", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { non_life_other: true },
    });
    const result = await tira.handleCallback(sampleNonLifeOtherCallbackParsed);

    expect(result.type).toBe("non_life_other");
    expect(result.extracted).toHaveProperty(
      "covernote_reference_number",
      "CN-NLO-2025-001",
    );
    expect(result.extracted).not.toHaveProperty("sticker_number");
  });

  it("returns non_life_other callback result from XML string", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { non_life_other: true },
    });
    const result = await tira.handleCallback(sampleNonLifeOtherCallbackXml);

    expect(result.type).toBe("non_life_other");
    expect(result.extracted).toHaveProperty(
      "covernote_reference_number",
      "CN-NLO-2025-001",
    );
    expect(result.extracted).not.toHaveProperty("sticker_number");
    expect(result.raw_xml).toBe(sampleNonLifeOtherCallbackXml);
  });

  it("throws on unknown response tag", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });
    const input = {
      TiraMsg: { UnknownTag: { SomeField: "value" }, MsgSignature: "abc" },
    };

    await expect(tira.handleCallback(input)).rejects.toThrow(
      "Unknown callback type",
    );
    await expect(tira.handleCallback(input)).rejects.toThrow("UnknownTag");
  });

  it("throws when callback type is known but not enabled", async () => {
    const tira = new Tira(mockTiraConfig); // no enabled_callbacks
    await expect(
      tira.handleCallback(sampleMotorCallbackParsed),
    ).rejects.toThrow("not enabled");
    await expect(
      tira.handleCallback(sampleMotorCallbackParsed),
    ).rejects.toThrow("motor");
  });

  it("returns body (full parsed object) for acknowledgement", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });
    const result = await tira.handleCallback(sampleMotorCallbackParsed);
    expect(result.body.TiraMsg).toBeDefined();
    expect(result.body.TiraMsg.MotorCoverNoteRefRes).toBeDefined();
  });

  it("raw_xml is empty string when input is pre-parsed object", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });
    const result = await tira.handleCallback(sampleMotorCallbackParsed);
    expect(result.raw_xml).toBe("");
  });

  it("raw_xml is the original string when input is string", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });
    const result = await tira.handleCallback(sampleMotorCallbackXml);
    expect(result.raw_xml).toBe(sampleMotorCallbackXml);
  });

  it("handles TIRA error callbacks (non-TIRA001 status)", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });
    const result = await tira.handleCallback(sampleMotorCallbackErrorParsed);

    expect(result.type).toBe("motor");
    expect(result.extracted).toHaveProperty("response_status_code", "TIRA020");
    expect(result.extracted).toHaveProperty("covernote_reference_number", "");
    expect(result.extracted).toHaveProperty("sticker_number", "");
  });
});

describe("Tira.handleCallback — motor_fleet (discriminator)", () => {
  it("resolves motor_fleet type when FleetResHdr is present", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor_fleet: true },
    });
    const result = await tira.handleCallback(sampleFleetCallbackParsed);

    expect(result.type).toBe("motor_fleet");
    expect(result.extracted).toHaveProperty("fleet_id", "FLT-001");
    expect(result.extracted).toHaveProperty("fleet_status_code", "TIRA001");
    expect(result.extracted).toHaveProperty("fleet_details");
    expect((result.extracted as any).fleet_details).toHaveLength(2);
  });

  it("handles single vehicle fleet (xml2js returns object, not array)", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor_fleet: true },
    });
    const result = await tira.handleCallback(
      sampleFleetCallbackSingleVehicleParsed,
    );

    expect(result.type).toBe("motor_fleet");
    expect((result.extracted as any).fleet_details).toHaveLength(1);
    expect((result.extracted as any).fleet_details[0].fleet_entry).toBe(1);
  });

  it("throws when motor_fleet is not enabled", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });
    await expect(
      tira.handleCallback(sampleFleetCallbackParsed),
    ).rejects.toThrow("not enabled");
    await expect(
      tira.handleCallback(sampleFleetCallbackParsed),
    ).rejects.toThrow("motor_fleet");
  });

  it("returns raw_xml when input is XML string", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor_fleet: true },
    });
    const result = await tira.handleCallback(sampleFleetCallbackXml);
    expect(result.type).toBe("motor_fleet");
    expect(result.raw_xml).toBe(sampleFleetCallbackXml);
  });

  it("still resolves regular motor when no FleetResHdr", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });
    const result = await tira.handleCallback(sampleMotorCallbackParsed);
    expect(result.type).toBe("motor");
  });
});

describe("Tira.acknowledge", () => {
  it("returns a TiraMsg-wrapped XML string", () => {
    const tira = new Tira(mockTiraConfig);
    const result = tira.acknowledge(sampleMotorCallbackParsed, "ACK-123");
    expect(result).toContain("<TiraMsg>");
    expect(result).toContain("<MsgSignature>");
  });

  it("calls signContent with the ack XML content", () => {
    const tira = new Tira(mockTiraConfig);
    tira.acknowledge(sampleMotorCallbackParsed, "ACK-123");
    expect(signContent).toHaveBeenCalledWith(
      expect.any(String),
      mockTiraConfig.pfx_path,
      mockTiraConfig.pfx_passphrase,
    );
  });

  it("calls wrapTiraMsg with content and signature", () => {
    const tira = new Tira(mockTiraConfig);
    tira.acknowledge(sampleMotorCallbackParsed, "ACK-123");
    expect(wrapTiraMsg).toHaveBeenCalledWith(
      expect.any(String),
      "mock-base64-signature",
    );
  });

  it("throws when parsedBody has no TiraMsg", () => {
    const tira = new Tira(mockTiraConfig);
    expect(() => tira.acknowledge({ NoTiraMsg: {} }, "ACK-123")).toThrow(
      "Missing TiraMsg",
    );
  });

  it("uses the provided acknowledgement ID (not hardcoded)", () => {
    const tira = new Tira(mockTiraConfig);
    const result = tira.acknowledge(
      sampleMotorCallbackParsed,
      "STK-2025-001-CUSTOM",
    );
    // The signContent mock receives the inner XML — check it contains the custom ID
    const signCall = vi.mocked(signContent).mock.calls[0]!;
    expect(signCall[0]).toContain("STK-2025-001-CUSTOM");
  });
});

describe("end-to-end callback flow", () => {
  it("parse callback → extract data → build ack ID from extracted data → acknowledge", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });

    // Step 1: Parse callback
    const result = await tira.handleCallback(sampleMotorCallbackParsed);
    expect(result.type).toBe("motor");

    // Step 2: Build ack ID from extracted data (real-world pattern)
    const ackId = `${result.extracted.covernote_reference_number}-${result.extracted.sticker_number}`;
    expect(ackId).toBe("CN-2025-001-STK-2025-001");

    // Step 3: Acknowledge
    const ackXml = tira.acknowledge(result.body, ackId);
    expect(ackXml).toContain("<TiraMsg>");
    expect(ackXml).toContain("<MsgSignature>");

    // Verify the ack content contains the custom ID
    const signCall = vi.mocked(signContent).mock.calls[0]!;
    expect(signCall[0]).toContain("CN-2025-001-STK-2025-001");
  });

  it("handles error callback gracefully — fields default to empty string", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });

    const result = await tira.handleCallback(sampleMotorCallbackErrorParsed);
    expect(result.extracted.response_status_code).toBe("TIRA020");
    expect(result.extracted.covernote_reference_number).toBe("");
    expect(result.extracted.sticker_number).toBe("");

    // User can still acknowledge error callbacks
    const ackXml = tira.acknowledge(
      result.body,
      `ERR-${result.extracted.request_id}`,
    );
    expect(ackXml).toContain("<TiraMsg>");
  });
});

describe("Tira.handleCallback signature verification", () => {
  it("sets signature_verified to true when verification succeeds with raw XML", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
      tira_public_pfx_path: "./certs/tiramispublic.pfx",
      tira_public_pfx_passphrase: "password",
    });
    const result = await tira.handleCallback(sampleMotorCallbackXml);
    expect(result.signature_verified).toBe(true);
    expect(verifySignature).toHaveBeenCalled();
  });

  it("sets signature_verified to false when tira_public_pfx_path is not configured", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
    });
    const result = await tira.handleCallback(sampleMotorCallbackXml);
    expect(result.signature_verified).toBe(false);
    expect(verifySignature).not.toHaveBeenCalled();
  });

  it("sets signature_verified to false when input is pre-parsed object", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
      tira_public_pfx_path: "./certs/tiramispublic.pfx",
    });
    const result = await tira.handleCallback(sampleMotorCallbackParsed);
    expect(result.signature_verified).toBe(false);
    expect(verifySignature).not.toHaveBeenCalled();
  });

  it("throws TiraSignatureError when verification fails", async () => {
    vi.mocked(verifySignature).mockReturnValueOnce(false);
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { motor: true },
      tira_public_pfx_path: "./certs/tiramispublic.pfx",
    });
    await expect(tira.handleCallback(sampleMotorCallbackXml)).rejects.toThrow(
      "signature verification failed",
    );
  });

  it("verifies non_life_other callback signature when configured", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { non_life_other: true },
      tira_public_pfx_path: "./certs/tiramispublic.pfx",
    });
    const result = await tira.handleCallback(sampleNonLifeOtherCallbackXml);
    expect(result.signature_verified).toBe(true);
    expect(result.type).toBe("non_life_other");
  });
});

describe("Tira.handleCallback — reinsurance", () => {
  it("returns reinsurance callback result when reinsurance is enabled", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { reinsurance: true },
    });
    const result = await tira.handleCallback(sampleReinsuranceCallbackParsed);

    expect(result.type).toBe("reinsurance");
    expect(result.extracted).toHaveProperty("response_id", "TIRA22424232355");
    expect(result.extracted).toHaveProperty("request_id", "NIC22424232355");
    expect(result.extracted).toHaveProperty("response_status_code", "TIRA001");
    expect(result.extracted).toHaveProperty(
      "response_status_desc",
      "Successful",
    );
  });

  it("throws when reinsurance is not enabled", async () => {
    const tira = new Tira(mockTiraConfig); // no enabled_callbacks
    await expect(
      tira.handleCallback(sampleReinsuranceCallbackParsed),
    ).rejects.toThrow("not enabled");
    await expect(
      tira.handleCallback(sampleReinsuranceCallbackParsed),
    ).rejects.toThrow("reinsurance");
  });

  it("returns raw_xml when input is XML string", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { reinsurance: true },
    });
    const result = await tira.handleCallback(sampleReinsuranceCallbackXml);

    expect(result.type).toBe("reinsurance");
    expect(result.raw_xml).toBe(sampleReinsuranceCallbackXml);
    expect(result.extracted).toHaveProperty("response_id", "TIRA22424232355");
  });

  it("raw_xml is empty string when input is pre-parsed object", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { reinsurance: true },
    });
    const result = await tira.handleCallback(sampleReinsuranceCallbackParsed);
    expect(result.raw_xml).toBe("");
  });

  it("does not include covernote_reference_number or sticker_number in extracted data", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { reinsurance: true },
    });
    const result = await tira.handleCallback(sampleReinsuranceCallbackParsed);
    expect(result.extracted).not.toHaveProperty("covernote_reference_number");
    expect(result.extracted).not.toHaveProperty("sticker_number");
  });
});

describe("Tira.handleCallback — policy", () => {
  it("returns policy callback result when policy is enabled", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { policy: true },
    });
    const result = await tira.handleCallback(samplePolicyCallbackParsed);

    expect(result.type).toBe("policy");
    expect(result.extracted).toHaveProperty("response_id", "TIRA22424232355");
    expect(result.extracted).toHaveProperty("request_id", "NIC22424232355");
    expect(result.extracted).toHaveProperty("response_status_code", "TIRA001");
    expect(result.extracted).toHaveProperty(
      "response_status_desc",
      "Successful",
    );
  });

  it("throws when policy is not enabled", async () => {
    const tira = new Tira(mockTiraConfig); // no enabled_callbacks
    await expect(
      tira.handleCallback(samplePolicyCallbackParsed),
    ).rejects.toThrow("not enabled");
    await expect(
      tira.handleCallback(samplePolicyCallbackParsed),
    ).rejects.toThrow("policy");
  });

  it("returns raw_xml when input is XML string", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { policy: true },
    });
    const result = await tira.handleCallback(samplePolicyCallbackXml);

    expect(result.type).toBe("policy");
    expect(result.raw_xml).toBe(samplePolicyCallbackXml);
    expect(result.extracted).toHaveProperty("response_id", "TIRA22424232355");
  });

  it("raw_xml is empty string when input is pre-parsed object", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { policy: true },
    });
    const result = await tira.handleCallback(samplePolicyCallbackParsed);
    expect(result.raw_xml).toBe("");
  });

  it("does not include covernote_reference_number or sticker_number in extracted data", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { policy: true },
    });
    const result = await tira.handleCallback(samplePolicyCallbackParsed);
    expect(result.extracted).not.toHaveProperty("covernote_reference_number");
    expect(result.extracted).not.toHaveProperty("sticker_number");
  });
});

describe("Tira constructor — claimNotification", () => {
  it("creates instance with claimNotification resource accessible", () => {
    const tira = new Tira(mockTiraConfig);
    expect(tira.claimNotification).toBeDefined();
  });
});

describe("Tira.handleCallback — claim_notification", () => {
  it("returns claim_notification callback result when enabled", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { claim_notification: true },
    });
    const result = await tira.handleCallback(
      sampleClaimNotificationCallbackParsed,
    );

    expect(result.type).toBe("claim_notification");
    expect(result.extracted).toHaveProperty("response_id", "TIRA22424232355");
    expect(result.extracted).toHaveProperty("request_id", "NIC22424232355");
    expect(result.extracted).toHaveProperty(
      "claim_reference_number",
      "3325253254",
    );
    expect(result.extracted).toHaveProperty("response_status_code", "TIRA001");
    expect(result.extracted).toHaveProperty(
      "response_status_desc",
      "Successful",
    );
  });

  it("throws when claim_notification is not enabled", async () => {
    const tira = new Tira(mockTiraConfig); // no enabled_callbacks
    await expect(
      tira.handleCallback(sampleClaimNotificationCallbackParsed),
    ).rejects.toThrow("not enabled");
    await expect(
      tira.handleCallback(sampleClaimNotificationCallbackParsed),
    ).rejects.toThrow("claim_notification");
  });

  it("returns raw_xml when input is XML string", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { claim_notification: true },
    });
    const result = await tira.handleCallback(
      sampleClaimNotificationCallbackXml,
    );

    expect(result.type).toBe("claim_notification");
    expect(result.raw_xml).toBe(sampleClaimNotificationCallbackXml);
    expect(result.extracted).toHaveProperty("response_id", "TIRA22424232355");
  });

  it("raw_xml is empty string when input is pre-parsed object", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { claim_notification: true },
    });
    const result = await tira.handleCallback(
      sampleClaimNotificationCallbackParsed,
    );
    expect(result.raw_xml).toBe("");
  });

  it("extracted data includes claim_reference_number", async () => {
    const tira = new Tira({
      ...mockTiraConfig,
      enabled_callbacks: { claim_notification: true },
    });
    const result = await tira.handleCallback(
      sampleClaimNotificationCallbackParsed,
    );
    expect(result.extracted).toHaveProperty(
      "claim_reference_number",
      "3325253254",
    );
  });
});
