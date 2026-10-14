import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: {
    default: "Ibeku League 2026",
    template: "%s | Ibeku League 2026",
  },
  description:
    "Official website of Ibeku League 2026 — fixtures, results, standings, teams and more. Sponsored by High Chief Dickson Oguguo Nzenwa Aku Bara-Oha 1 Of Ibeku Ancient Kingdom.",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1 pb-20 md:pb-8">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
