import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import Nav from "@/components/Nav";
import ScrollingBanner from "@/components/ScrollingBanner";

const spaceGrotesk = localFont({
  src: "../../public/fonts/space-grotesk-bold.ttf",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The League of Extraordinary Assholes",
  description: "League hub: polls, notes, trades, news, and history.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.className} h-full antialiased`}>
      <body className="league-canvas min-h-full flex flex-col bg-neo-paper">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Nav />
        <ScrollingBanner />
        <main id="main-content" className="league-main mx-auto w-full max-w-6xl flex-1">
          {children}
        </main>
        <footer className="border-t-4 border-neo-ink bg-neo-highlight py-6 text-center text-xs text-neo-ink">
          The League of Extraordinary Assholes — Est. 2013
        </footer>
      </body>
    </html>
  );
}
