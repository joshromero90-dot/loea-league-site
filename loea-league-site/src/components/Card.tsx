import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`neo-card ${className}`}
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
      className="group neo-card neo-card-link"
    >
      <div className="mb-2 text-2xl">{emoji}</div>
      <h3 className="font-bold uppercase tracking-tight text-neo-ink group-hover:text-neo-ink">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neo-ink">{description}</p>
    </Link>
  );
}
