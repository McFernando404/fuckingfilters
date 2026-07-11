"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAccount } from "@/lib/account";
import { fileToAvatar, useProfile } from "@/lib/profile";
import { fetchUsage, type ServerUsage } from "@/lib/worker";
import { AccountDialog } from "./account-dialog";
import { LoginButton } from "./buttons";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="rounded-2xl border border-line bg-surface p-5 shadow-[0_20px_60px_-30px_var(--glow)] sm:p-6"
    >
      {title && (
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
          {title}
        </h2>
      )}
      {children}
    </motion.section>
  );
}

export function AccountView() {
  const { t, locale } = useI18n();
  const { account, mounted, clearAccount } = useAccount();
  const { profile, mounted: profileMounted, persistError, setDisplayName, setAvatar } =
    useProfile();
  const [usage, setUsage] = useState<ServerUsage | null>(null);
  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    fetchUsage(account).then((u) => {
      if (!cancelled) setUsage(u);
    });
    return () => {
      cancelled = true;
    };
  }, [account]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const fromChat = searchParams?.get("from") === "chat";
  const backHref = fromChat ? "/chat" : "/";
  const backLabel = fromChat ? t.account.backToChat : t.account.backToHome;

  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [fileError, setFileError] = useState(false);

  useEffect(() => {
    setName(profile.displayName);
  }, [profile.displayName]);

  const fmt = (n: number) => n.toLocaleString(locale === "es" ? "es" : "en");

  const copy = async () => {
    if (!account) return;
    const flash = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    };
    try {
      await navigator.clipboard.writeText(account);
      flash();
      return;
    } catch {
      /* Clipboard API unavailable (non-secure context / blocked) — fallback */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = account;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      flash();
    } catch {
      /* last resort: the key <code> is also selectable (select-all) */
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      // Reject oversized images before reading/decoding them — a 50MP phone
      // photo would otherwise spike memory and crash the tab.
      if (f.size > 8 * 1024 * 1024) {
        setFileError(true);
        e.target.value = "";
        return;
      }
      try {
        const url = await fileToAvatar(f);
        setAvatar(url);
        setFileError(false);
      } catch {
        setFileError(true);
      }
    }
    e.target.value = "";
  };

  const logout = () => {
    clearAccount();
    router.push("/");
  };

  // ---- Guest state (no account) ----
  if (!mounted) {
    return <div className="relative min-h-dvh bg-[var(--base)]" />;
  }
  if (!account) {
    return (
      <div className="relative min-h-dvh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="aurora absolute left-[-10%] top-[-10%] h-[34rem] w-[34rem]" />
          <div className="aurora absolute right-[-10%] bottom-[-20%] h-[30rem] w-[30rem]" />
        </div>
        <header className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link
            href={backHref}
            className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-3xl text-white shadow-[0_10px_40px_-12px_var(--glow)]">
            ◈
          </span>
          <h1 className="mt-5 text-xl font-semibold">{t.account.guestTitle}</h1>
          <p className="mt-2 max-w-xs text-sm text-muted">{t.account.guestBody}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setDialog(true)}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_-12px_var(--glow)] transition hover:brightness-110"
            >
              {t.hero.primary}
            </button>
            <LoginButton />
          </div>
          <AccountDialog open={dialog} onClose={() => setDialog(false)} />
        </main>
      </div>
    );
  }

  // ---- Signed-in page ----
  const ready = mounted && profileMounted;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">{t.nav.skipToContent}</a>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="aurora absolute left-[-10%] top-[-10%] h-[34rem] w-[34rem]" />
        <div className="aurora absolute right-[-10%] bottom-[-20%] h-[30rem] w-[30rem]" />
      </div>

      <header className="mx-auto flex h-16 w-full max-w-3xl items-center px-4 sm:px-6">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <span aria-hidden>←</span>
          {backLabel}
        </Link>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl space-y-5 px-4 pb-16 outline-none sm:px-6">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface-2 text-2xl text-white shadow-[0_10px_30px_-12px_var(--glow)]"
            aria-label={t.account.changeAvatar}
          >
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="bg-gradient-to-br from-accent to-accent-2 bg-clip-text text-transparent">
                {(profile.displayName || "A").charAt(0).toUpperCase()}
              </span>
            )}
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {profile.displayName || t.account.viewTitle}
            </h1>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t.account.signedInAs}
            </span>
          </div>
        </div>

        {/* Profile editor */}
        <Card title={t.account.profileSection}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2"
            >
              {t.account.changeAvatar}
            </button>
            {profile.avatar && (
              <button
                type="button"
                onClick={() => setAvatar(null)}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-accent-warm"
              >
                {t.account.removeAvatar}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
          <p className="mt-2 text-[11px] text-muted">{t.account.avatarHint}</p>
          {persistError && (
            <p role="status" className="mt-2 rounded-lg border border-accent-warm/40 bg-accent-warm/10 p-2 text-[11px] text-accent-warm">
              {t.account.storageWarning}
            </p>
          )}
          {fileError && (
            <p role="status" className="mt-2 rounded-lg border border-accent-warm/40 bg-accent-warm/10 p-2 text-[11px] text-accent-warm">
              {t.account.avatarError}
            </p>
          )}

          <label
            htmlFor="account-display-name"
            className="mt-5 block text-xs font-medium uppercase tracking-wider text-muted"
          >
            {t.account.displayName}
          </label>
          <input
            id="account-display-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setDisplayName(name.trim())}
            placeholder={t.account.displayNamePlaceholder}
            maxLength={32}
            className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-[var(--ring)]"
          />

          <label id="apikey-label" className="mt-5 block text-xs font-medium uppercase tracking-wider text-muted">
            {t.account.apiKey}
          </label>
          <div className="mt-1.5 rounded-xl border border-line bg-surface-2 px-3 py-2.5">
            <code aria-labelledby="apikey-label" className="block max-h-28 w-full select-all overflow-y-auto break-all font-mono text-xs leading-relaxed text-fg">
              {account
                ? revealed
                  ? account
                  : "•".repeat(account.length)
                : ""}
            </code>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                aria-pressed={revealed}
                className="rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
              >
                {revealed ? `◉ ${t.account.hideKey}` : `◯ ${t.account.showKey}`}
              </button>
              <button
                type="button"
                onClick={copy}
                className="rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
              >
                {copied ? `✓ ${t.account.copied}` : t.account.copy}
              </button>
            </div>
          </div>
        </Card>

        {/* Usage */}
        <Card title={t.account.usageSection}>
          <div className="grid grid-cols-3 gap-3">
            <Stat label={t.account.tokensUsed} value={ready ? fmt(usage?.tokens_used ?? 0) : "0"} />
            <Stat label={t.account.messagesStat} value={ready ? fmt(usage?.messages ?? 0) : "0"} />
            <Stat label={t.account.conversationsStat} value={ready ? fmt(usage?.chats ?? 0) : "0"} />
          </div>
          <p className="mt-3 text-[11px] text-muted">
            {ready && usage
              ? `${t.account.dailyUsage}: ${usage.messages_today} / ${usage.daily_limit}`
              : ""}
          </p>
        </Card>

        {/* Limits & billing */}
        <Card title={t.account.limits}>
          <div className="space-y-1.5">
            {(() => {
              const daily = usage?.daily_limit ?? 50;
              const rows = [
                { label: t.account.dailyLimit, value: fmt(daily) },
                { label: t.account.weeklyLimit, value: fmt(daily * 7) },
                { label: t.account.monthlyLimit, value: fmt(daily * 30) },
              ];
              return rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg border border-line bg-surface-2/50 px-3 py-2 text-sm"
                >
                  <span className="text-muted">{row.label}</span>
                  <span className="font-semibold tabular-nums text-fg">{row.value}</span>
                </div>
              ));
            })()}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-2/50 px-3 py-2.5 text-sm font-medium text-muted opacity-70"
            >
              ♡ {t.account.donate}
            </button>
            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-2/50 px-3 py-2.5 text-sm font-medium text-muted opacity-70"
            >
              ◈ {t.account.buyLicense}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">{t.account.comingSoon}</p>
        </Card>

        {/* Logout */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-accent-warm/40 bg-accent-warm/10 px-5 py-2.5 text-sm font-semibold text-accent-warm transition-colors hover:bg-accent-warm/20"
          >
            ⏻ {t.account.logout}
          </button>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-3 text-center">
      <div className="text-2xl font-semibold tracking-tight text-fg">{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}
