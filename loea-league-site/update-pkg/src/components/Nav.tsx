import Link from "next/link";
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
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🏈</span>
          <span className="font-bold tracking-tight text-slate-100">
            The League of{" "}
            <span className="text-amber-400">Extraordinary Assholes</span>
          </span>
        </Link>

        {profile && (
          <div className="hidden items-center gap-3 md:flex">
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

      {profile && (
        <nav className="hidden max-w-6xl gap-1 overflow-x-auto px-4 pb-2 md:mx-auto md:flex">
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
    </header>
  );
}
