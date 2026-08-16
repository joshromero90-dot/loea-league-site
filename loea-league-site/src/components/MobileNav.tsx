"use client";

import { useState } from "react";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import type { Profile } from "@/lib/profile";

export default function MobileNav({
  links,
  profile,
}: {
  links: { href: string; label: string }[];
  profile: Profile;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300"
        aria-label="Toggle menu"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-slate-800 bbg-slate-950 px-4 py-3">
          <p className="mb-2 text-sm text-slate-400">
            {profile.display_name}
            {profile.is_commissioner && (
              <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                Commissioner
              </span>
            )}
          </p>
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-amber-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
