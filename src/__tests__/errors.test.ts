import { describe, it, expect } from "vitest";
import { TiraError, TiraApiError, TiraValidationError } from "../errors.js";

describe("TiraError", () => {
  it("extends Error", () => {
    const err = new TiraError("test message");
    expect(err).toBeInstanceOf(Error);
  });

  it("has name 'TiraError'", () => {
    const err = new TiraError("test message");
    expect(err.name).toBe("TiraError");
  });

  it("message is set correctly", () => {
    const err = new TiraError("something went wrong");
    expect(err.message).toBe("something went wrong");
  });
});

describe("TiraApiError", () => {
  it("extends TiraError", () => {
    const err = new TiraApiError(401, "Unauthorized");
    expect(err).toBeInstanceOf(TiraError);
  });

  it("extends Error", () => {
    const err = new TiraApiError(401, "Unauthorized");
    expect(err).toBeInstanceOf(Error);
  });

  it("has name 'TiraApiError'", () => {
    const err = new TiraApiError(404, "Not Found");
    expect(err.name).toBe("TiraApiError");
  });

  it("has status and statusText properties", () => {
    const err = new TiraApiError(401, "Unauthorized");
    expect(err.status).toBe(401);
    expect(err.statusText).toBe("Unauthorized");
  });

  it("message includes status code and text", () => {
    const err = new TiraApiError(401, "Unauthorized");
    expect(err.message).toBe("Tira API error: 401 Unauthorized");
  });
});

describe("TiraValidationError", () => {
  it("extends TiraError", () => {
    const err = new TiraValidationError("bad field", "callback_url");
    expect(err).toBeInstanceOf(TiraError);
  });

  it("extends Error", () => {
    const err = new TiraValidationError("bad field", "callback_url");
    expect(err).toBeInstanceOf(Error);
  });

  it("has name 'TiraValidationError'", () => {
    const err = new TiraValidationError("bad field", "callback_url");
    expect(err.name).toBe("TiraValidationError");
  });

  it("has field property", () => {
    const err = new TiraValidationError("URL required", "callback_url");
    expect(err.field).toBe("callback_url");
  });

  it("message is set correctly", () => {
    const err = new TiraValidationError("must be HTTPS", "callback_url");
    expect(err.message).toBe("must be HTTPS");
  });
});
