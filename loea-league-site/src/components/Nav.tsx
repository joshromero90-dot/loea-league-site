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
  { href: "/trade-board", label: "Trade Board" },
  {
    label: "Updates",
    children: [
      { href: "/notes", label: "Commissioner Notes" },
      { href: "/polls", label: "Polls" },
      { href: "/news", label: "News" },
    ],
  },
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
    <header className="league-nav border-b-4 border-neo-ink bg-neo-paper sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center border-4 border-neo-ink bg-neo-highlight p-2 shadow-neo-sm">
            <Image
              src="/LoEA6@4x.png"
              alt="The League of Extraordinary Assholes"
              width={649}
              height={240}
              className="h-12 w-auto sm:h-16"
              priority
              unoptimized
            />
          </Link>

          {profile && (
            <nav className="hidden flex-wrap items-center gap-1 xl:flex">
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
                    className="whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-neo-ink transition hover:bg-neo-highlight hover:text-neo-ink"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          )}
        </div>

        {profile && (
          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <Link
              href="/profile"
              className="text-sm text-neo-ink transition hover:text-neo-ink"
            >
              {profile.display_name}
              {profile.is_commissioner && (
                <span className="ml-2 border-4 border-neo-ink bg-neo-highlight px-2 py-0.5 text-xs font-bold uppercase text-neo-ink">
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
