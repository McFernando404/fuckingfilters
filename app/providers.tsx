"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { I18nProvider } from "@/lib/i18n";
import { AccountProvider } from "@/lib/account";
import { ChatProvider } from "@/lib/chat-store";
import { DevGuard } from "@/components/dev-guard";
import type { Locale } from "@/lib/dictionaries";
import type { ReactNode } from "react";

export function Providers({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* reducedMotion="user" makes every framer-motion animation honor the
          OS prefers-reduced-motion setting (instant instead of transform/opacity). */}
      <MotionConfig reducedMotion="user">
        <I18nProvider initialLocale={initialLocale}>
          <AccountProvider>
            {/* ChatProvider lives above the routes so an in-flight reply keeps
                generating when the user navigates away from /chat and back. */}
            <ChatProvider>
              <DevGuard />
              {children}
            </ChatProvider>
          </AccountProvider>
        </I18nProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
