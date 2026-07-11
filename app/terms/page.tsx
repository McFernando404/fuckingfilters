import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageOG, pageTwitter } from "@/lib/og";

const title = "Terms of Use — F*ckingFilters";
const description = "The terms that govern your use of F*ckingFilters.";
export const metadata: Metadata = {
  title,
  description,
  openGraph: pageOG(title, description),
  twitter: pageTwitter(title, description),
};

export default function TermsPage() {
  return <LegalPage kind="terms" />;
}
