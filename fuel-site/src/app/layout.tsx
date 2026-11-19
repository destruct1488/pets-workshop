import type { Metadata, Viewport } from "next";
import "@fontsource-variable/onest";
import "./globals.css";
import { company } from "@/lib/site";

const description =
  "Оптові поставки світлих нафтопродуктів з Європи в Україну: власні бензовози, залізничний, річковий і морський транспорт. Сертифікат і паспорт якості на кожну поставку.";

export const metadata: Metadata = {
  title: `${company.name}: оптові поставки нафтопродуктів`,
  description,
  openGraph: {
    title: `${company.name}: оптові поставки нафтопродуктів`,
    description,
    locale: "uk_UA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f7f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
