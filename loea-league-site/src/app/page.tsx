import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/Card";
import Link from "next/link";
import Image from "next/image";
import { espnConfigured, getEspnStandings, type EspnStandings } from "@/lib/espn";

export default async function Home() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: recentNotes }, { data: openPolls }] = await Promise.all([
    supabase
      .from("notes")
      .select("id,title,created_at")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("polls")
      .select("id,question")
      .eq("is_closed", false)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  let standings: EspnStandings | null = null;
  let standingsError: string | null = null;
  if (espnConfigured()) {
    try {
      standings = await getEspnStandings();
    } catch (err) {
      standingsError =
        err instanceof Error ? err.message : "Couldn't load standings.";
    }
  }

  return (
    <div>
      <div className="league-hero mb-10">
        <span className="neo-sticker">The League of Extraordinary Assholes</span>
        <h1 className="text-4xl font-black uppercase tracking-tight text-neo-ink sm:text-5xl">
          Welcome back{profile ? `, ${profile.display_name}` : ""} 🏆
        </h1>
        <p className="mt-1 text-neo-ink">
          Everything for The League of Extraordinary Assholes, in one place.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
        <Card className="bg-neo-accent">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black uppercase tracking-tight text-neo-ink">📌 New Notes</h2>
            <Link
              href="/notes"
              className="text-xs font-bold uppercase text-neo-ink hover:underline"
            >
              All notes →
            </Link>
          </div>
          {recentNotes && recentNotes.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {recentNotes.map((n) => (
                <li key={n.id}>
                  <Link
                    href="/notes"
                    className="text-sm text-neo-ink hover:underline"
                  >
                    {n.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neo-ink">No notes yet.</p>
          )}
        </Card>

        <Card className="bg-neo-accent">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black uppercase tracking-tight text-neo-ink">🗳️ Open Polls</h2>
            <Link
              href="/polls"
              className="text-xs font-bold uppercase text-neo-ink hover:underline"
            >
              All polls →
            </Link>
          </div>
          {openPolls && openPolls.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {openPolls.map((p) => (
                <li key={p.id}>
                  <Link
                    href="/polls"
                    className="text-sm text-neo-ink hover:underline"
                  >
                    {p.question}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neo-ink">No open polls.</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-black uppercase tracking-tight text-neo-ink">📊 Standings</h2>
          <Link
            href="/standings"
            className="text-xs font-bold uppercase text-neo-ink hover:underline"
          >
            Full standings →
          </Link>
        </div>

        {!espnConfigured() && (
          <p className="text-sm text-neo-ink">
            Live standings aren&apos;t connected yet.
          </p>
        )}
        {espnConfigured() && standingsError && (
          <p className="text-sm text-neo-error">{standingsError}</p>
        )}
        {standings && standings.teams.length > 0 && (
          <div className="league-table">
            <table className="w-full text-sm">
              <thead className="bg-neo-highlight text-left text-xs uppercase tracking-wide text-neo-ink">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Team</th>
                  <th className="px-3 py-2 text-right">W-L-T</th>
                  <th className="px-3 py-2 text-right">PF</th>
                </tr>
              </thead>
              <tbody>
                {standings.teams.map((team, i) => (
                  <tr
                    key={team.id}
                    className={
                      i === 0
                        ? "border-t border-neo-ink bg-neo-accent text-neo-ink"
                        : "border-t border-neo-ink text-neo-ink"
                    }
                  >
                    <td className={i === 0 ? "px-3 py-2 font-black" : "px-3 py-2 text-neo-ink"}>
                      {i + 1}
                    </td>
                    <td className="px-3 py-2 font-bold">{team.name}</td>
                    <td className="px-3 py-2 text-right">
                      {team.wins}-{team.losses}
                      {team.ties ? `-${team.ties}` : ""}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {team.pointsFor.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="prize-panel mt-10 grid grid-cols-1 sm:grid-cols-[3fr_2fr]">
        <div className="bg-neo-paper p-2">
          <Image
            src="/trophy.jpg"
            alt="The league championship trophy: a guy in a recliner wearing a football helmet, working a laptop"
            width={900}
            height={792}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center bg-neo-accent p-6 sm:p-8">
          <span className="text-xs font-bold uppercase tracking-wide text-neo-ink">
            The Prize
          </span>
          <h2 className="mt-1 text-2xl font-black uppercase leading-tight tracking-tight text-neo-ink sm:text-3xl">
            Win the league.
            <br />
            Take the chair.
          </h2>
          <p className="mt-3 text-sm font-bold text-neo-ink">
            Current Champion: Ryan Long AKA OJ&apos;s house OJ Didn&apos;t Do It.
          </p>
        </div>
      </div>
    </div>
  );
}
