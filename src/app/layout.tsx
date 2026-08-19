import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Notifications } from "@/components/notification/Notifications";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { BRAND_NAME_FA } from "@/config/brand";
import { publicEnv } from "@/config/env";
import { getDirection } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  colorScheme: "dark",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;

  return {
    metadataBase: new URL(publicEnv.appUrl),
    title: {
      default: BRAND_NAME_FA,
      template: `%s | ${BRAND_NAME_FA}`,
    },
    description: meta.siteDescription,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", type: "image/png" }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: BRAND_NAME_FA,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      suppressHydrationWarning
      className={`${vazirmatn.variable} flex h-full flex-col antialiased`}
    >
      <body className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
        <QueryProvider>
          <LocaleProvider>
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            <Notifications />
          </LocaleProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
