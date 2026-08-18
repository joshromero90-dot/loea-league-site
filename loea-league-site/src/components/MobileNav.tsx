"use client";

import { useState } from "react";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import type { Profile } from "@/lib/profile";
import type { NavItem } from "./Nav";

export default function MobileNav({
  links,
  profile,
}: {
  links: NavItem[];
  profile: Profile;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="border-2 border-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-300"
        aria-label="Toggle menu"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full border-b-2 border-slate-800 bg-slate-950 px-4 py-3">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="mb-2 block text-sm text-slate-400 hover:text-amber-400"
          >
            {profile.display_name}
            {profile.is_commissioner && (
              <span className="ml-2 border-2 border-slate-800 bg-yellow-400 px-2 py-0.5 text-xs font-bold uppercase text-slate-100">
                Commissioner
              </span>
            )}
          </Link>
          <div className="flex flex-col gap-1">
            {links.map((link) =>
              link.children ? (
                <div key={link.label} className="flex flex-col">
                  <span className="mt-2 px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {link.label}
                  </span>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-amber-400"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-amber-400"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
          <div className="mt-3">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
