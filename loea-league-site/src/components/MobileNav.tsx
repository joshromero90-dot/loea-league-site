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
    <div className="xl:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="border-4 border-neo-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-neo-ink"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <div id="mobile-navigation" className="absolute left-0 right-0 top-full max-h-[80dvh] overflow-y-auto border-b-4 border-neo-ink bg-neo-paper px-4 py-3">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="mb-2 block text-sm text-neo-ink hover:text-neo-ink"
          >
            {profile.display_name}
            {profile.is_commissioner && (
              <span className="ml-2 border-4 border-neo-ink bg-neo-yellow px-2 py-0.5 text-xs font-bold uppercase text-neo-ink">
                Commissioner
              </span>
            )}
          </Link>
          <div className="flex flex-col gap-2">
            {links.map((link) =>
              link.children ? (
                <div key={link.label} className="flex flex-col">
                  <span className="mt-2 px-2 pb-1 text-xs font-bold uppercase tracking-wide text-neo-ink">
                    {link.label}
                  </span>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 text-sm font-bold text-neo-ink hover:bg-neo-yellow hover:text-neo-ink"
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
                  className="px-2 py-2 text-sm font-bold text-neo-ink hover:bg-neo-yellow hover:text-neo-ink"
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
