import { espnConfigured, getEspnStandings, type EspnStandings } from "@/lib/espn";

export default async function StandingsPage() {
  if (!espnConfigured()) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tight text-slate-100">
          📊 Standings
        </h1>
        <p className="text-sm text-slate-400">
          Live standings aren&apos;t connected yet. Add{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5">
            ESPN_LEAGUE_ID
          </code>{" "}
          and{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5">
            ESPN_SEASON_YEAR
          </code>{" "}
          (and, for private leagues,{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5">ESPN_SWID</code>
          /
          <code className="rounded bg-slate-800 px-1.5 py-0.5">ESPN_S2</code>)
          to your environment variables. See the setup guide included with
          this project.
        </p>
      </div>
    );
  }

  let standings: EspnStandings | null = null;
  let errorMessage: string | null = null;
  try {
    standings = await getEspnStandings();
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Couldn't load standings.";
  }

  if (errorMessage || !standings) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tight text-slate-100">
          📊 Standings
        </h1>
        <p className="text-sm text-red-400">{errorMessage}</p>
      </div>
    );
  }

  const { teams, seasonYear, currentWeek } = standings;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-black uppercase tracking-tight text-slate-100">📊 Standings</h1>
      <p className="mb-6 text-sm text-slate-500">
        {seasonYear} season{currentWeek ? ` · Week ${currentWeek}` : ""} ·
        synced from ESPN
      </p>

      <div className="overflow-hidden border-2 border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase tracking-wide text-slate-950">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-right">W-L-T</th>
              <th className="px-4 py-3 text-right">PF</th>
              <th className="px-4 py-3 text-right">PA</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, i) => (
              <tr key={team.id} className="border-t border-slate-800 text-slate-200">
                <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{team.name}</td>
                <td className="px-4 py-3 text-right">
                  {team.wins}-{team.losses}
                  {team.ties ? `-${team.ties}` : ""}
                </td>
                <td className="px-4 py-3 text-right">{team.pointsFor.toFixed(1)}</td>
                <td className="px-4 py-3 text-right">
                  {team.pointsAgainst.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
