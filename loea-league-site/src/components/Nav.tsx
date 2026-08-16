import Link from "next/link";
import Image from "next/image";
import { getCurrentProfile } from "@/lib/profile";
import SignOutButton from "./SignOutButton";
import MobileNav from "./MobileNav";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/standings", label: "Standings" },
  { href: "/polls", label: "Polls" },
  { href: "/notes", label: "Manager Notes" },
  { href: "/trade-board", label: "Trade Board" },
  { href: "/news", label: "News" },
  { href: "/resources", label: "Links" },
  { href: "/rules", label: "Rules" },
  { href: "/history", label: "Hall of Fame" },
];

export default async function Nav() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-slate-800 bg-[#1b1b1c]/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="The League of Extraordinary Assholes"
              width={480}
              height={313}
              className="h-48 w-auto"
              priority
            />
          </Link>

          {profile && (
            <nav className="hidden flex-wrap items-center gap-1 md:flex">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-amber-400"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {profile && (
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <span className="text-sm text-slate-400">
              {profile.display_name}
              {profile.is_commissioner && (
                <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  Commissioner
                </span>
              )}
            </span>
            <SignOutButton />
          </div>
        )}

        {profile && <MobileNav links={LINKS} profile={profile} />}
      </div>
    </header>
  );
}
