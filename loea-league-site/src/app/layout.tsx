import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "The League of Extraordinary Assholes",
  description: "League hub: polls, notes, trades, news, and history.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950">
        <Nav />
        <div className="border-b-2 border-slate-800">
          <div className="mx-auto flex max-w-6xl flex-wrap items-stretch justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                (Est. 2013)
              </span>
              <span className="text-sm font-black uppercase tracking-tight text-slate-100">
                It&apos;s all about offensive coordinators, bub. - Kohl Wingfield
              </span>
            </div>
            <div className="flex items-center bg-yellow-400 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-100">
              10 Teams · 1 Champion
            </div>
          </div>
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          The League of Extraordinary Assholes — est. {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
