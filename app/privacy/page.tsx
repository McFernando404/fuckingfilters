import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageOG, pageTwitter } from "@/lib/og";

const title = "Privacy Policy — F*ckingFilters";
const description = "What F*ckingFilters stores and what it does not.";
export const metadata: Metadata = {
  title,
  description,
  openGraph: pageOG(title, description),
  twitter: pageTwitter(title, description),
};

export default function PrivacyPage() {
  return <LegalPage kind="privacy" />;
}
