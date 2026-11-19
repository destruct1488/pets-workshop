import type { PriceItem, PriceSnapshot } from "@/lib/prices";

/**
 * Prices typed in from the price photo dated 19.11.2026. The site shows these
 * until the Telegram bot publishes a newer snapshot (then the stored one wins).
 * Unit "грн/л" is an assumption: the photo does not print it.
 */
const rows: [region: string, diesel: number, a95: number, propane: number][] = [
  ["Вінниця", 84.8, 71.55, 59.2],
  ["Луцьк", 84.75, 70.25, 59.45],
  ["Дніпро", 86.0, 73.45, 61.9],
  ["Житомир", 85.05, 71.5, 59.75],
  ["Ужгород", 85.35, 71.25, 60.0],
  ["Запорізька", 86.3, 73.7, 62.15],
  ["Ів.Франківськ", 84.0, 70.5, 58.45],
  ["Київ", 85.7, 72.35, 60.5],
  ["Київська обл.", 86.0, 72.45, 60.75],
  ["Кропивницький", 84.95, 72.45, 60.75],
  ["Львів", 84.4, 69.85, 59.2],
  ["Миколаїв", 83.95, 71.55, 59.95],
  ["Одеса", 83.3, 70.9, 59.3],
  ["Полтава", 86.8, 73.7, 62.0],
  ["Рівне", 84.9, 70.6, 59.45],
  ["Суми", 87.45, 73.7, 62.35],
  ["Тернопіль", 83.7, 70.5, 58.7],
  ["Харків", 86.95, 74.4, 62.8],
  ["Херсонська", 84.4, 71.95, 60.4],
  ["Хмельницький", 83.8, 71.0, 58.7],
  ["Черкаси", 85.6, 72.95, 60.85],
  ["Чернігів", 86.5, 72.7, 61.25],
  ["Чернівці", 83.5, 70.3, 57.95],
];

const items: PriceItem[] = rows.flatMap(([region, diesel, a95, propane]) => [
  { region, product: "Дизельне пальне", price: diesel, unit: "грн/л" },
  { region, product: "Бензин А-95", price: a95, unit: "грн/л" },
  { region, product: "Пропан-бутан", price: propane, unit: "грн/л" },
]);

export const FALLBACK_PRICES: PriceSnapshot = {
  updatedAt: "2026-11-19T00:00:00.000Z",
  priceDate: "2026-11-19",
  items,
};
