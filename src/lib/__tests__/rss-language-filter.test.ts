import { describe, it, expect } from "vitest";
import { isLikelyEnglish } from "../rss-client";

describe("isLikelyEnglish", () => {
  it("accepts plain English titles", () => {
    expect(isLikelyEnglish("Fed raises interest rates by 25 basis points")).toBe(true);
    expect(isLikelyEnglish("Oil prices surge amid Middle East tensions")).toBe(true);
    expect(isLikelyEnglish("S&P 500 hits record high")).toBe(true);
  });

  it("accepts English titles with smart quotes and em-dashes", () => {
    expect(isLikelyEnglish("Trump\u2019s tariffs shake global markets")).toBe(true);
    expect(isLikelyEnglish("ECB\u2019s Simkus: Central bank shouldn\u2019t raise rates")).toBe(true);
    expect(isLikelyEnglish("Markets rally \u2014 but for how long?")).toBe(true);
  });

  it("accepts English titles with accented Latin characters", () => {
    expect(isLikelyEnglish("Macr\u00f3n meets Z\u00fcrich bankers")).toBe(true);
    expect(isLikelyEnglish("Sa\u00f3 Paulo exchange rebounds")).toBe(true);
  });

  it("rejects Arabic titles", () => {
    expect(isLikelyEnglish("\u0627\u0644\u0645\u062a\u062f\u0627\u0648\u0644 \u0627\u0644\u0639\u0631\u0628\u064a")).toBe(false);
  });

  it("rejects Chinese titles", () => {
    expect(isLikelyEnglish("\u5bcc\u9014\u725b\u725b")).toBe(false);
    expect(isLikelyEnglish("\u4e2d\u56fd\u80a1\u5e02\u4eca\u65e5\u5927\u6da8")).toBe(false);
  });

  it("rejects Cyrillic titles", () => {
    expect(isLikelyEnglish("\u0420\u043e\u0441\u0441\u0438\u0439\u0441\u043a\u0438\u0439 \u0440\u044b\u043d\u043e\u043a \u0430\u043a\u0446\u0438\u0439")).toBe(false);
  });

  it("rejects mixed English + Arabic", () => {
    expect(isLikelyEnglish("Markets crash \u0627\u0644\u0623\u0633\u0648\u0627\u0642 \u062a\u0646\u0647\u0627\u0631")).toBe(false);
  });

  it("rejects Korean titles", () => {
    expect(isLikelyEnglish("\ud55c\uad6d \uc8fc\uc2dd\uc2dc\uc7a5")).toBe(false);
  });

  it("rejects Japanese titles", () => {
    expect(isLikelyEnglish("\u65e5\u672c\u9280\u884c\u91d1\u5229\u6c7a\u5b9a")).toBe(false);
  });

  it("accepts short titles with one stray Unicode char", () => {
    expect(isLikelyEnglish("Fed rate decision \u2022 live")).toBe(true);
  });

  it("rejects empty or very short strings", () => {
    expect(isLikelyEnglish("")).toBe(false);
    expect(isLikelyEnglish("Hi")).toBe(false);
  });
});
