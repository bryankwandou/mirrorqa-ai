import type { Metadata } from "next";
import "./globals.css";
import "./product.css";
import "./details.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mirrorqa-ai.vercel.app"),
  title: { default: "MirrorQA — Watch customers struggle before they leave", template: "%s — MirrorQA" },
  description: "Autonomous synthetic customers drive your real product flows and return evidence-backed friction reports.",
  openGraph: { title: "MirrorQA", description: "See where real customer types get stuck before your customers do.", type: "website" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
