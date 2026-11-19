import { describe, expect, it } from "vitest";
import { cleanText, diffPrices, formatSummary, groupByRegion, validateItems } from "../src/lib/prices";

describe("validateItems", () => {
  it("accepts a normal table and normalises values", () => {
    const result = validateItems({
      items: [
        { region: " Київ ", product: "ДП", price: "52,40", unit: "грн/л" },
        { region: null, product: "А-95", price: 55.9, unit: "грн/л" },
      ],
    });
    expect(result).toEqual({
      ok: true,
      items: [
        { region: "Київ", product: "ДП", price: 52.4, unit: "грн/л" },
        { region: null, product: "А-95", price: 55.9, unit: "грн/л" },
      ],
    });
  });

  it("rejects empty, malformed and absurd data", () => {
    expect(validateItems({ items: [] }).ok).toBe(false);
    expect(validateItems(null).ok).toBe(false);
    expect(validateItems({ items: [{ product: "ДП", price: -1, unit: "грн/л" }] }).ok).toBe(false);
    expect(validateItems({ items: [{ product: "ДП", price: 1e9, unit: "грн/л" }] }).ok).toBe(false);
    expect(validateItems({ items: [{ product: "ДП", price: "abc", unit: "грн/л" }] }).ok).toBe(false);
    expect(validateItems({ items: [{ product: "", price: 10, unit: "грн/л" }] }).ok).toBe(false);
    expect(validateItems({ items: [{ product: "ДП", price: 10, unit: "" }] }).ok).toBe(false);
    expect(validateItems({ items: ["text"] }).ok).toBe(false);
  });

  it("limits the number of rows", () => {
    const many = Array.from({ length: 201 }, (_, i) => ({ product: `p${i}`, price: 1, unit: "u" }));
    expect(validateItems({ items: many }).ok).toBe(false);
  });

  it("strips markup characters from text", () => {
    const result = validateItems({ items: [{ product: "<b>ДП</b>\u0000", price: 10, unit: "грн/л" }] });
    expect(result.ok && result.items[0].product).toBe("b ДП /b");
  });

  it("keeps the last value for duplicate rows", () => {
    const result = validateItems({
      items: [
        { product: "ДП", price: 10, unit: "грн/л" },
        { product: "ДП", price: 12, unit: "грн/л" },
      ],
    });
    expect(result.ok && result.items).toEqual([{ region: null, product: "ДП", price: 12, unit: "грн/л" }]);
  });
});

describe("cleanText", () => {
  it("limits length and ignores non-strings", () => {
    expect(cleanText("a".repeat(500), 10)).toHaveLength(10);
    expect(cleanText(42, 10)).toBe("");
  });
});

describe("diffPrices", () => {
  const before = [{ region: null, product: "ДП", price: 50, unit: "грн/л" }];
  it("flags moves above 10%", () => {
    const changes = diffPrices(before, [{ region: null, product: "ДП", price: 60, unit: "грн/л" }]);
    expect(changes).toHaveLength(1);
    expect(Math.round(changes[0].pct * 100)).toBe(20);
  });
  it("ignores small moves and unknown items", () => {
    expect(diffPrices(before, [{ region: null, product: "ДП", price: 52, unit: "грн/л" }])).toEqual([]);
    expect(diffPrices(before, [{ region: null, product: "Газ", price: 99, unit: "грн/л" }])).toEqual([]);
    expect(diffPrices(undefined, before)).toEqual([]);
  });
});

describe("formatting", () => {
  it("builds a summary and mentions big changes", () => {
    const items = [{ region: "Київ", product: "ДП", price: 60, unit: "грн/л" }];
    const changes = diffPrices([{ region: "Київ", product: "ДП", price: 50, unit: "грн/л" }], items);
    const text = formatSummary(items, changes);
    expect(text).toContain("Київ · ДП");
    expect(text).toContain("різка зміна");
  });

  it("groups by region with the no-region group first", () => {
    const groups = groupByRegion([
      { region: "Львів", product: "ДП", price: 1, unit: "u" },
      { region: null, product: "ДП", price: 1, unit: "u" },
      { region: "Київ", product: "ДП", price: 1, unit: "u" },
    ]);
    expect(groups.map((g) => g.region)).toEqual([null, "Київ", "Львів"]);
  });
});
