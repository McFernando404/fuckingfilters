import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { OG_IMAGE, OG_SITE_NAME } from "@/lib/og";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "F*ckingFilters — Uncensored, private AI";
const description =
  "Chat with uncensored, filter-free AI — neutral models, no censorship. We store nothing but an anonymous account code. Monero-only.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: OG_SITE_NAME,
    title,
    description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the locale cookie (written by lib/i18n.tsx) so the server-rendered
  // <html lang> matches the user's preference on first paint.
  const ck = await cookies();
  const locale = ck.get("aiu_locale")?.value === "es" ? "es" : "en";

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      {/* suppressHydrationWarning: a browser extension injects attributes
          (e.g. bis_register, __processed__) onto <body> before React hydrates,
          causing a benign attribute mismatch. This silences only body-level
          attribute/text diffs, not deeper child mismatches. */}
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <div id="app-root">
          <Providers initialLocale={locale}>{children}</Providers>
        </div>
        {/* Continuously strip browser-extension-injected attributes (e.g.
            bis_skin_checked from Bitdefender, __processed__) via a
            MutationObserver so they never reach React's hydration pass. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=function(e){if(!e||!e.attributes)return;var a=e.attributes;for(var j=a.length-1;j>=0;j--){var n=a[j].name;if(n.indexOf('bis_')===0||n.indexOf('__')===0)e.removeAttribute(n);}};var all=document.querySelectorAll('*');for(var i=0;i<all.length;i++)s(all[i]);new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='attributes'&&m.attributeName&&(m.attributeName.indexOf('bis_')===0||m.attributeName.indexOf('__')===0)){m.target.removeAttribute(m.attributeName);}if(m.type==='childList'){m.addedNodes.forEach(function(n){if(n.nodeType===1){s(n);if(n.querySelectorAll){n.querySelectorAll('*').forEach(s);}}});}});}).observe(document.documentElement,{attributes:true,childList:true,subtree:true});})();`,
          }}
        />
      </body>
    </html>
  );
}
