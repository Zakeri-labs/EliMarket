import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Vazirmatn } from "next/font/google";
import { cookies } from "next/headers";
import { Notifications } from "@/components/notification/Notifications";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { BRAND_NAME_FA } from "@/config/brand";
import { publicEnv } from "@/config/env";
import {
  DEFAULT_THEME,
  THEME_COOKIE,
  isStorefrontTheme,
} from "@/config/theme";
import { getDirection } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1210" },
  ],
  colorScheme: "dark light",
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
  const themeCookie = (await cookies()).get(THEME_COOKIE)?.value;
  const theme = isStorefrontTheme(themeCookie) ? themeCookie : DEFAULT_THEME;

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} ${vazirmatn.variable} theme-${theme} flex h-full flex-col antialiased`}
    >
      <body className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
        <QueryProvider>
          <ThemeProvider>
            <LocaleProvider initialLocale={locale}>
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
              <Notifications />
            </LocaleProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
