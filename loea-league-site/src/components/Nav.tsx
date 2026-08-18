import Link from "next/link";
import Image from "next/image";
import { getCurrentProfile } from "@/lib/profile";
import SignOutButton from "./SignOutButton";
import MobileNav from "./MobileNav";
import NavDropdown from "./NavDropdown";

export type NavLink = { href: string; label: string; children?: undefined };
export type NavGroup = {
  href?: undefined;
  label: string;
  children: { href: string; label: string }[];
};
export type NavItem = NavLink | NavGroup;

const LINKS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/standings", label: "Standings" },
  {
    label: "Updates",
    children: [
      { href: "/notes", label: "Manager Notes" },
      { href: "/polls", label: "Polls" },
      { href: "/news", label: "News" },
    ],
  },
  { href: "/trade-board", label: "Trade Board" },
  {
    label: "League Info",
    children: [
      { href: "/managers", label: "Managers" },
      { href: "/resources", label: "Links" },
      { href: "/rules", label: "Rules" },
      { href: "/history", label: "Hall of Fame" },
    ],
  },
];

export default async function Nav() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b-2 border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/LoEA6@4x.png"
              alt="The League of Extraordinary Assholes"
              width={880}
              height={325}
              className="h-20 w-auto"
              priority
            />
          </Link>

          {profile && (
            <nav className="hidden flex-wrap items-center gap-1 md:flex">
              {LINKS.map((link) =>
                link.children ? (
                  <NavDropdown
                    key={link.label}
                    label={link.label}
                    links={link.children}
                  />
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-300 transition hover:bg-slate-800 hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          )}
        </div>

        {profile && (
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <Link
              href="/profile"
              className="text-sm text-slate-400 transition hover:text-amber-400"
            >
              {profile.display_name}
              {profile.is_commissioner && (
                <span className="ml-2 border-2 border-slate-800 bg-yellow-400 px-2 py-0.5 text-xs font-bold uppercase text-slate-100">
                  Commissioner
                </span>
              )}
            </Link>
            <SignOutButton />
          </div>
        )}

        {profile && <MobileNav links={LINKS} profile={profile} />}
      </div>
    </header>
  );
}
