import { describe, expect, it } from "vitest";
import { PIXEL_ID, mayTrack, needsConsent, type ConsentRecord } from "@/lib/advertising-consent";

describe("Advertising permission", () => {
  it("uses the supplied pixel", () => { expect(PIXEL_ID).toBe("1117060627478676"); });
  it("blocks consent regions until acceptance", () => { expect(mayTrack("PT", null)).toBe(false); expect(needsConsent("GB")).toBe(true); });
  it("blocks unresolved and Tor regions", () => { expect(mayTrack("XX", null)).toBe(false); expect(mayTrack("T1", null)).toBe(false); });
  it("permits ordinary measurement outside consent regions", () => { expect(mayTrack("AO", null)).toBe(true); });
  it("honors refusal even outside consent regions", () => { expect(mayTrack("AO", { advertising: false } as ConsentRecord)).toBe(false); });
  it("permits an explicitly accepted choice", () => { expect(mayTrack("PT", { advertising: true } as ConsentRecord)).toBe(true); });
});