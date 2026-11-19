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
      priceDate: null,
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

  it("groups by region keeping the original order", () => {
    const groups = groupByRegion([
      { region: "Львів", product: "ДП", price: 1, unit: "u" },
      { region: null, product: "ДП", price: 1, unit: "u" },
      { region: "Київ", product: "ДП", price: 1, unit: "u" },
    ]);
    expect(groups.map((g) => g.region)).toEqual(["Львів", null, "Київ"]);
  });
});

import fixture from "./fixtures/price-photo-2026-11-19.json";
import { formatDate, parsePriceDate, toMatrix } from "../src/lib/prices";

describe("real price photo (19.11.2026)", () => {
  const result = validateItems(fixture);

  it("is accepted with its date", () => {
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(69);
    expect(result.priceDate).toBe("2026-11-19");
  });

  it("pivots into 23 regions and 3 fuels in the original order", () => {
    if (!result.ok) throw new Error("fixture rejected");
    const m = toMatrix(result.items);
    expect(m.products.map((p) => p.name)).toEqual(["Дизельне пальне", "Бензин А-95", "Пропан-бутан"]);
    expect(m.rows).toHaveLength(23);
    expect(m.rows[0]).toEqual({ region: "Вінниця", cells: [84.8, 71.55, 59.2] });
    expect(m.rows.find((r) => r.region === "Київ")?.cells).toEqual([85.7, 72.35, 60.5]);
    expect(m.rows.at(-1)).toEqual({ region: "Чернівці", cells: [83.5, 70.3, 57.95] });
  });

  it("makes a Telegram summary that fits one message", () => {
    if (!result.ok) throw new Error("fixture rejected");
    const text = formatSummary(result.items, [], result.priceDate);
    expect(text.length).toBeLessThan(3800);
    expect(text).toContain("Київ: Дизельне пальне 85,70");
    expect(text).toContain("19 листопада 2026");
  });
});

describe("parsePriceDate", () => {
  it("accepts real dates and rejects the rest", () => {
    expect(parsePriceDate("19.11.2026")).toBe("2026-11-19");
    expect(parsePriceDate("2026-11-19")).toBe("2026-11-19");
    expect(parsePriceDate("31.02.2026")).toBeNull();
    expect(parsePriceDate("yesterday")).toBeNull();
    expect(parsePriceDate(null)).toBeNull();
    expect(formatDate("2026-11-19")).toContain("2026");
  });
});
