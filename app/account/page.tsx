import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/account-view";
import { pageOG, pageTwitter } from "@/lib/og";

const title = "My account — F*ckingFilters";
const description = "Your anonymous account, profile and usage.";
export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: pageOG(title, description),
  twitter: pageTwitter(title, description),
};

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountView />
    </Suspense>
  );
}
