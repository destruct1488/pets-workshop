export type PriceItem = {
  region: string | null;
  product: string;
  price: number;
  unit: string;
};

export type PriceSnapshot = {
  updatedAt: string;
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
  | { ok: true; items: PriceItem[] }
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
  return { ok: true, items: [...byKey.values()] };
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
export function formatSummary(items: PriceItem[], changes: PriceChange[]): string {
  const lines = items.map(
    (i) => `${i.region ? i.region + " · " : ""}${i.product}: ${formatPrice(i.price)} ${i.unit}`,
  );
  let text = `Розпізнано рядків: ${items.length}\n\n${lines.join("\n")}`;
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

/** Groups items by region for display; items without a region go first. */
export function groupByRegion(items: PriceItem[]): { region: string | null; items: PriceItem[] }[] {
  const groups = new Map<string | null, PriceItem[]>();
  for (const item of items) {
    const list = groups.get(item.region) ?? [];
    list.push(item);
    groups.set(item.region, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === null ? -1 : b === null ? 1 : a.localeCompare(b, "uk")))
    .map(([region, list]) => ({ region, items: list }));
}
