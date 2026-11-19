export type PriceItem = {
  region: string | null;
  product: string;
  price: number;
  unit: string;
};

export type PriceSnapshot = {
  updatedAt: string;
  /** Date printed on the price table itself (YYYY-MM-DD), when it has one. */
  priceDate?: string | null;
  items: PriceItem[];
};

export type PriceChange = {
  region: string | null;
  product: string;
  unit: string;
  from: number;
  to: number;
  pct: number;
};

export type ValidationResult =
  | { ok: true; items: PriceItem[]; priceDate: string | null }
  | { ok: false; error: string };

const MAX_ITEMS = 200;
const MAX_PRICE = 1_000_000;

/** Strips control characters and angle brackets, collapses spaces, limits length. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function parsePrice(value: unknown): number | null {
  let n: number;
  if (typeof value === "number") {
    n = value;
  } else if (typeof value === "string") {
    n = Number(value.replace(/\s/g, "").replace(",", "."));
  } else {
    return null;
  }
  if (!Number.isFinite(n) || n <= 0 || n >= MAX_PRICE) return null;
  return Math.round(n * 100) / 100;
}

function keyOf(item: Pick<PriceItem, "region" | "product" | "unit">): string {
  return `${item.region ?? ""}|${item.product}|${item.unit}`.toLowerCase();
}

/**
 * Checks data that came back from the model. The model reads text from a
 * photo, so everything is treated as untrusted: types, ranges and lengths
 * are enforced here before anything is stored or shown.
 */
/** Accepts "19.11.2026" (or ISO) and returns "2026-11-19", or null if it is not a real date. */
export function parsePriceDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  let y: number, m: number, d: number;
  const dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (dotted) [d, m, y] = [Number(dotted[1]), Number(dotted[2]), Number(dotted[3])];
  else if (iso) [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function validateItems(raw: unknown): ValidationResult {
  const list =
    Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray((raw as { items?: unknown }).items)
        ? (raw as { items: unknown[] }).items
        : null;

  if (!list) return { ok: false, error: "Відповідь не містить списку цін." };
  if (list.length === 0) return { ok: false, error: "На фото не знайдено таблицю з цінами." };
  if (list.length > MAX_ITEMS) return { ok: false, error: `Забагато рядків (максимум ${MAX_ITEMS}).` };

  const byKey = new Map<string, PriceItem>();
  for (const entry of list) {
    if (!entry || typeof entry !== "object") {
      return { ok: false, error: "Рядок цін має неправильний формат." };
    }
    const e = entry as Record<string, unknown>;
    const product = cleanText(e.product, 80);
    const unit = cleanText(e.unit, 20);
    const region = cleanText(e.region, 80) || null;
    const price = parsePrice(e.price);
    if (!product) return { ok: false, error: "У одного з рядків немає назви товару." };
    if (!unit) return { ok: false, error: `Для «${product}» не вказано одиницю виміру.` };
    if (price === null) return { ok: false, error: `Для «${product}» ціна не схожа на число.` };
    const item: PriceItem = { region, product, price, unit };
    byKey.set(keyOf(item), item);
  }
  const priceDate =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? parsePriceDate((raw as { price_date?: unknown }).price_date)
      : null;
  return { ok: true, items: [...byKey.values()], priceDate };
}

/** Lists items whose price moved by more than `threshold` (0.1 = 10%). */
export function diffPrices(
  previous: PriceItem[] | undefined,
  next: PriceItem[],
  threshold = 0.1,
): PriceChange[] {
  if (!previous?.length) return [];
  const before = new Map(previous.map((p) => [keyOf(p), p]));
  const changes: PriceChange[] = [];
  for (const item of next) {
    const old = before.get(keyOf(item));
    if (!old) continue;
    const pct = (item.price - old.price) / old.price;
    if (Math.abs(pct) > threshold) {
      changes.push({
        region: item.region,
        product: item.product,
        unit: item.unit,
        from: old.price,
        to: item.price,
        pct,
      });
    }
  }
  return changes;
}

const nf = new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatPrice = (n: number) => nf.format(n);

/** Plain-text summary for the Telegram confirmation message (no markup). */
export function formatSummary(items: PriceItem[], changes: PriceChange[], priceDate?: string | null): string {
  const units = new Set(items.map((i) => i.unit));
  const singleUnit = units.size === 1 ? [...units][0] : null;
  const lines = groupByRegion(items).map((group) => {
    const cells = group.items
      .map((i) => `${i.product} ${formatPrice(i.price)}${singleUnit ? "" : " " + i.unit}`)
      .join("; ");
    return group.region ? `${group.region}: ${cells}` : cells;
  });
  const dateText = priceDate ? `Дата в таблиці: ${formatDate(priceDate)}\n` : "";
  let text =
    `Розпізнано рядків: ${items.length}\n${dateText}${singleUnit ? `Одиниця: ${singleUnit}\n` : ""}\n` +
    lines.join("\n");
  if (changes.length) {
    text +=
      "\n\nУвага, різка зміна ціни (більше 10%):\n" +
      changes
        .map(
          (c) =>
            `${c.region ? c.region + " · " : ""}${c.product}: ${formatPrice(c.from)} → ${formatPrice(c.to)} (${c.pct > 0 ? "+" : ""}${Math.round(c.pct * 100)}%)`,
        )
        .join("\n");
  }
  text += "\n\nПеревірте цифри та натисніть кнопку нижче.";
  return text.length > 3800 ? text.slice(0, 3790) + "…" : text;
}

/** "2026-11-19" -> "19 листопада 2026 р." */
export function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("uk-UA", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type PriceMatrix = {
  products: { name: string; unit: string }[];
  rows: { region: string | null; cells: (number | null)[] }[];
};

/**
 * Pivots items into a region x product grid. Order follows the original table
 * (first appearance), so the website reads like the photo that was sent.
 */
export function toMatrix(items: PriceItem[]): PriceMatrix {
  const products: PriceMatrix["products"] = [];
  const productIndex = new Map<string, number>();
  const rowIndex = new Map<string | null, PriceMatrix["rows"][number]>();
  const rows: PriceMatrix["rows"] = [];

  for (const item of items) {
    const pKey = `${item.product}|${item.unit}`.toLowerCase();
    if (!productIndex.has(pKey)) {
      productIndex.set(pKey, products.length);
      products.push({ name: item.product, unit: item.unit });
    }
  }
  for (const item of items) {
    let row = rowIndex.get(item.region);
    if (!row) {
      row = { region: item.region, cells: products.map(() => null) };
      rowIndex.set(item.region, row);
      rows.push(row);
    }
    row.cells[productIndex.get(`${item.product}|${item.unit}`.toLowerCase())!] = item.price;
  }
  return { products, rows };
}

/** Groups items by region, keeping the order of the original table. */
export function groupByRegion(items: PriceItem[]): { region: string | null; items: PriceItem[] }[] {
  const groups = new Map<string | null, PriceItem[]>();
  for (const item of items) {
    const list = groups.get(item.region) ?? [];
    list.push(item);
    groups.set(item.region, list);
  }
  return [...groups.entries()].map(([region, list]) => ({ region, items: list }));
}
