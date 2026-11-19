// All company facts come from the company presentation (TANKER_2025.pdf).
// Edit them here; the page reads everything from this file.

export const company = {
  name: "ТАНКЕР-ОІЛ КОМПАНІ",
  nameLatin: "TANKER-OIL COMPANY",
  legalName: "ТОВ «ТАНКЕР-ОІЛ КОМПАНІ»",
  edrpou: "45609470",
  address: "Україна, 03061, місто Київ, проспект Відрадний, 95, корпус літ. Б, офіс 209",
  addressEn: "95, Vidradny Ave, building B, office 209, Kyiv city, Ukraine, 03061",
  email: "tankeroil2025@gmail.com",
  telegramUrl: "https://t.me/TankerOilCompany",
  telegramLabel: "t.me/TankerOilCompany",
  since: 2004,
} as const;

export type Phone = { display: string; href: string };

const phone = (display: string): Phone => ({
  display,
  href: "tel:+" + display.replace(/\D/g, ""),
});

export const phoneGroups: { title: string; phones: Phone[] }[] = [
  { title: "Імпорт, великий гурт", phones: [phone("+38 063 844 78 38"), phone("+38 050 844 78 38")] },
  { title: "Великий і дрібний гурт", phones: [phone("+38 073 844 78 38"), phone("+38 066 844 78 38")] },
];

export const mainPhone = phoneGroups[0].phones[0];

export const facts = [
  { value: `з ${company.since}`, text: "року працюємо з перевалкою, реалізацією та постачанням нафтопродуктів" },
  { value: "10+", text: "сучасних бензовозів і газовозів щодня виконують рейси з ЄС в Україну, по всіх регіонах" },
  { value: "100+", text: "співробітників щодня забезпечують потреби клієнтів компанії" },
  { value: "1000+ т", text: "одночасного завантаження, розмитнення, відвантаження та зберігання на власних АЗС і залучених нафтобазах" },
] as const;

export const transport = [
  { id: "road", title: "Автоцистерни", text: "Власні бензовози та газовози" },
  { id: "rail", title: "Залізниця", text: "Залізничний транспорт" },
  { id: "river", title: "Річковий транспорт", text: "Постачання річкою" },
  { id: "sea", title: "Морський транспорт", text: "Постачання морем" },
] as const;

export const originCountries = [
  "Німеччина",
  "Латвія",
  "Литва",
  "Польща",
  "Молдова",
  "Румунія",
  "Греція",
] as const;

export const navLinks = [
  { href: "#prices", label: "Ціни" },
  { href: "#contacts", label: "Контакти" },
] as const;
