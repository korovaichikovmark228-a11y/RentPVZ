import Script from "next/script";
import { Onest } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const YM_ID = 111240069;

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

        {/* Yandex.Metrika counter */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<e.scripts.length;j++){if(e.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}','ym');ym(${YM_ID},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true});`}
        </Script>
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YM_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
      </body>
    </html>
  );
}
