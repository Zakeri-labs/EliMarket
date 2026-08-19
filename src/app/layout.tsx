import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Notifications } from "@/components/notification/Notifications";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { DEFAULT_LOCALE, getDirection } from "@/i18n/config";
import { BRAND_NAME_FA } from "@/config/brand";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME_FA,
    template: `%s | ${BRAND_NAME_FA}`,
  },
  description: "خرید آنلاین — EliMarket",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  themeColor: "#0f0f0f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND_NAME_FA,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={getDirection(DEFAULT_LOCALE)}
      suppressHydrationWarning
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <LocaleProvider>
            {children}
            <Notifications />
          </LocaleProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
