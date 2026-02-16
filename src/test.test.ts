import { describe, it, expect } from "vitest";
import { testFunction } from "./test";

describe("testFunction", () => {
  it("should return a greeting with the given name", () => {
    expect(testFunction("World")).toBe("Hello, World!");
  });

  it("should handle an empty string", () => {
    expect(testFunction("")).toBe("Hello, !");
  });

  it("should handle special characters", () => {
    expect(testFunction("O'Brien")).toBe("Hello, O'Brien!");
  });
});
