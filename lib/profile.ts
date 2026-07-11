"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "./account";

const GUEST_KEY = "aiu_profile_guest";

export interface Profile {
  displayName: string;
  avatar: string | null; // data URL (256×256 jpeg)
}

const DEFAULT: Profile = { displayName: "", avatar: null };

/**
 * Profile storage is keyed to the account (like chats): each account gets its
 * own slot so a different account on a shared device never inherits the
 * previous user's display name / avatar.
 */
function storageKeyFor(account: string | null): string {
  if (!account) return GUEST_KEY;
  return "aiu_profile_" + account.slice(-24);
}

function loadProfile(key: string): { profile: Profile; failed: boolean } {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { profile: DEFAULT, failed: false };
    // Validate field types — a corrupt/hand-edited entry must not crash
    // consumers (e.g. account-view's `.charAt(0)` on displayName).
    const parsed: unknown = JSON.parse(raw);
    const obj =
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : {};
    const displayName =
      typeof obj.displayName === "string" ? obj.displayName.slice(0, 64) : "";
    const avatar = typeof obj.avatar === "string" ? obj.avatar : null;
    return { profile: { displayName, avatar }, failed: false };
  } catch {
    // Unreadable blob — signal failure so the caller does NOT auto-overwrite
    // it with DEFAULT (preserving any recoverable data).
    return { profile: DEFAULT, failed: true };
  }
}

/**
 * Optional profile metadata (display name + avatar). Client/localStorage only.
 * The account KEY (aiu_account) is the real credential; this is just cosmetics.
 */
export function useProfile() {
  const { account } = useAccount();
  const key = storageKeyFor(account);
  const keyRef = useRef(key);
  keyRef.current = key;

  const [profile, setProfile] = useState<Profile>(DEFAULT);
  const [mounted, setMounted] = useState(false);
  const [persistError, setPersistError] = useState(false);
  const loadFailed = useRef(false);
  const firstPersist = useRef(true);

  // (Re)load whenever the storage key changes (account login/logout/switch).
  useEffect(() => {
    const { profile: loaded, failed } = loadProfile(key);
    loadFailed.current = failed;
    setProfile(loaded);
    setMounted(true);
  }, [key]);

  // Multi-tab: reload when another tab writes our profile key.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      const { profile: loaded, failed } = loadProfile(key);
      loadFailed.current = failed;
      setProfile(loaded);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  useEffect(() => {
    if (!mounted) return;
    if (firstPersist.current || loadFailed.current) {
      // Skip the first persist after mount (profile may still be DEFAULT from
      // before the load committed) and after a failed load (preserve the blob).
      firstPersist.current = false;
      loadFailed.current = false;
      return;
    }
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(profile));
      setPersistError(false);
    } catch {
      setPersistError(true);
    }
  }, [profile, mounted]);

  const setDisplayName = useCallback((displayName: string) => {
    setProfile((p) => ({ ...p, displayName }));
  }, []);

  const setAvatar = useCallback((avatar: string | null) => {
    setProfile((p) => ({ ...p, avatar }));
  }, []);

  return { profile, mounted, persistError, setDisplayName, setAvatar };
}

/**
 * Read an image File, cover-crop to 256×256 and return a compact JPEG data URL
 * (small enough to live in localStorage without blowing the quota).
 */
export function fileToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image decode failed"));
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unavailable"));
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
