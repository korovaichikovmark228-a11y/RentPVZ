import { Onest } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Аренда вещей рядом — заберите в вашем пункте выдачи",
  description:
    "Перфоратор на вечер, отпариватель на выходные, коляску на поездку. Заберите нужную вещь по коду в ближайшем ПВЗ Ozon, Яндекс Маркет или Wildberries и верните туда же. Без залога паспортом, оплата картой.",
  openGraph: {
    title: "Аренда вещей рядом — в вашем пункте выдачи",
    description:
      "Берите нужную вещь в ближайшем ПВЗ и возвращайте туда же. Без поездок через город, без залога паспортом.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0b5cff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={onest.className}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
