import { describe, it, expect } from "vitest";
import { formatDateForTira } from "../utils.js";

describe("formatDateForTira", () => {
  it("converts a UTC ISO string to EAT (UTC+3) and strips Z and milliseconds", () => {
    // 2025-06-15T10:30:00.000Z UTC → 2025-06-15T13:30:00 EAT
    expect(formatDateForTira("2025-06-15T10:30:00.000Z")).toBe(
      "2025-06-15T13:30:00",
    );
  });

  it("accepts a Date object", () => {
    const date = new Date("2025-01-01T00:00:00.000Z");
    // UTC midnight → 03:00 EAT
    expect(formatDateForTira(date)).toBe("2025-01-01T03:00:00");
  });

  it("handles date strings without Z suffix (parsed as local time)", () => {
    // Without Z, new Date() treats the string as local time.
    // The function still adds +3h to the UTC representation.
    const input = "2025-03-20T12:00:00";
    const utcMs = new Date(input).getTime();
    const expectedEat = new Date(utcMs + 3 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 19);
    expect(formatDateForTira(input)).toBe(expectedEat);
  });

  it("shifts the date forward when EAT conversion crosses midnight", () => {
    // 2025-12-31T22:00:00Z UTC → 2026-01-01T01:00:00 EAT
    expect(formatDateForTira("2025-12-31T22:00:00.000Z")).toBe(
      "2026-01-01T01:00:00",
    );
  });

  it("returns exactly 19 characters (YYYY-MM-DDTHH:MM:SS)", () => {
    const result = formatDateForTira("2025-06-15T10:30:45.123Z");
    expect(result).toHaveLength(19);
  });

  it("does not contain Z or milliseconds", () => {
    const result = formatDateForTira("2025-06-15T10:30:45.999Z");
    expect(result).not.toContain("Z");
    expect(result).not.toContain(".");
  });

  it("preserves seconds", () => {
    expect(formatDateForTira("2025-06-15T10:30:45.000Z")).toBe(
      "2025-06-15T13:30:45",
    );
  });
});
