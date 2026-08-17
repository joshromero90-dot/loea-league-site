import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/Card";
import Link from "next/link";
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          Welcome back{profile ? `, ${profile.display_name}` : ""} 🏆
        </h1>
        <p className="mt-1 text-slate-400">
          Everything for The League of Extraordinary Assholes, in one place.
        </p>
      </div>

      <Card className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-100">📊 Standings</h2>
          <Link
            href="/standings"
            className="text-xs text-amber-400 hover:underline"
          >
            Full standings →
          </Link>
        </div>

        {!espnConfigured() && (
          <p className="text-sm text-slate-500">
            Live standings aren&apos;t connected yet.
          </p>
        )}
        {espnConfigured() && standingsError && (
          <p className="text-sm text-red-400">{standingsError}</p>
        )}
        {standings && standings.teams.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-left text-slate-400">
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
                    className="border-t border-slate-800 text-slate-200"
                  >
                    <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{team.name}</td>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">📌 New Notes</h2>
            <Link
              href="/notes"
              className="text-xs text-amber-400 hover:underline"
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
                    className="text-sm text-amber-400 hover:underline"
                  >
                    {n.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No notes yet.</p>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">🗳️ Open Polls</h2>
            <Link
              href="/polls"
              className="text-xs text-amber-400 hover:underline"
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
                    className="text-sm text-amber-400 hover:underline"
                  >
                    {p.question}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No open polls.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
