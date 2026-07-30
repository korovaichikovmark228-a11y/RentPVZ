import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata = {
  title: "Аренда вещей рядом — заберите в вашем пункте выдачи",
  description:
    "Перфоратор на вечер, отпариватель на выходные, коляска на поездку. Заберите нужную вещь по коду в ближайшем ПВЗ Ozon, Яндекс Маркет или Wildberries и верните туда же. Без залога паспортом, оплата картой.",
  openGraph: {
    title: "Аренда вещей рядом — в вашем пункте выдачи",
    description:
      "Берите нужную вещь в ближайшем ПВЗ и возвращайте туда же. Без поездок через город, без залога паспортом.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
