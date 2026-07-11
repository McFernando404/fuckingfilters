import type { Metadata } from "next";
import { ChatView } from "@/components/chat-view";
import { pageOG, pageTwitter } from "@/lib/og";

const title = "Chat — F*ckingFilters";
const description = "Private AI chat. Your conversations stay in your browser.";
export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: pageOG(title, description),
  twitter: pageTwitter(title, description),
};

export default function ChatPage() {
  return <ChatView />;
}
