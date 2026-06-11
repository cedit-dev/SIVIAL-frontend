import { describe, expect, it } from "vitest";

import { normalizeGravity, normalizeVehicle, parseDate } from "./normalizers.js";

describe("normalizers", () => {
  it("parses Colombian Spanish short dates", () => {
    expect(parseDate("26-ene-23")).toBe("2023-01-26");
  });

  it("maps gravity from deaths and injuries", () => {
    expect(normalizeGravity(1, 0)).toBe("fatal");
    expect(normalizeGravity(0, 2)).toBe("grave");
    expect(normalizeGravity(0, 0)).toBe("solo_danos");
  });

  it("cleans empty vehicles", () => {
    expect(normalizeVehicle("*")).toBeNull();
    expect(normalizeVehicle("MOTOCICLETA")).toBe("motocicleta");
  });
});
