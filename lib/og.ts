import type { Metadata } from "next";

/** Shared OpenGraph/Twitter constants so every route emits a complete card
 * (Next shallow-merges nested openGraph, so child pages must re-include
 * type/siteName/image-dimensions rather than inheriting them). */
export const OG_SITE_NAME = "F*ckingFilters";
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "F*ckingFilters",
};

export function pageOG(title: string, description: string) {
  return {
    type: "website" as const,
    siteName: OG_SITE_NAME,
    title,
    description,
    images: [OG_IMAGE],
  } satisfies NonNullable<Metadata["openGraph"]>;
}

export function pageTwitter(title: string, description: string) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: ["/og.png"],
  } satisfies NonNullable<Metadata["twitter"]>;
}
