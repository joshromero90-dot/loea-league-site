import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`border-2 border-slate-800 bg-slate-900 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardLink({
  href,
  title,
  description,
  emoji,
}: {
  href: string;
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className="group border-2 border-slate-800 bg-slate-900 p-5 transition hover:border-amber-500 hover:bg-amber-500/5"
    >
      <div className="mb-2 text-2xl">{emoji}</div>
      <h3 className="font-bold uppercase tracking-tight text-slate-100 group-hover:text-amber-500">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </Link>
  );
}
