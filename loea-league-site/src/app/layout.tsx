import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import Nav from "@/components/Nav";

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
        <div className="border-b-4 border-neo-ink bg-neo-yellow">
          <div className="mx-auto flex max-w-6xl flex-wrap items-stretch justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide text-neo-ink">
                (Est. 2013)
              </span>
              <span className="text-sm font-black uppercase tracking-tight text-neo-ink">
                It&apos;s all about offensive coordinators, bub. - Kohl Wingfield
              </span>
            </div>
            <div className="flex items-center bg-neo-yellow px-4 py-3 text-xs font-bold uppercase tracking-wide text-neo-ink">
              10 Teams · 1 Champion
            </div>
          </div>
        </div>
        <main id="main-content" className="league-main mx-auto w-full max-w-6xl flex-1">
          {children}
        </main>
        <footer className="border-t-4 border-neo-ink bg-neo-yellow py-6 text-center text-xs text-neo-ink">
          The League of Extraordinary Assholes — est. {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
