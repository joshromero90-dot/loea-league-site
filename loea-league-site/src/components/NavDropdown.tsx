"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type SubLink = { href: string; label: string };

export default function NavDropdown({
  label,
  links,
}: {
  label: string;
  links: SubLink[];
}) {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
  };

  const handleLeave = () => {
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-300 transition hover:bg-slate-800 hover:text-amber-400"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[10rem] border-2 border-slate-800 bg-slate-900 py-1 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-amber-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
