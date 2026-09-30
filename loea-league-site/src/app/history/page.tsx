import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { Card } from "@/components/Card";
import NewHallOfFameEntryForm from "@/components/NewHallOfFameEntryForm";
import {
  espnHistoryConfigured,
  getEspnHallOfFameHistory,
  type EspnHallOfFameSeason,
} from "@/lib/espn";

type HallOfFameRow = {
  id: string;
  season_year: number;
  champion_team: string | null;
  champion_manager: string | null;
  runner_up_team: string | null;
  runner_up_manager: string | null;
  last_place_team: string | null;
  last_place_manager: string | null;
  punishment: string | null;
  notes: string | null;
};

type MergedSeason = {
  seasonYear: number;
  championTeam: string | null;
  championManager: string | null;
  runnerUpTeam: string | null;
  runnerUpManager: string | null;
  lastPlaceTeam: string | null;
  lastPlaceManager: string | null;
  punishment: string | null;
  notes: string | null;
  fromEspn: boolean;
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: entries }, espnHistory] = await Promise.all([
    supabase
      .from("hall_of_fame")
      .select("*")
      .order("season_year", { ascending: false }),
    espnHistoryConfigured()
      ? getEspnHallOfFameHistory().catch(() => [] as EspnHallOfFameSeason[])
      : Promise.resolve([] as EspnHallOfFameSeason[]),
  ]);

  const manualByYear = new Map<number, HallOfFameRow>();
  (entries as HallOfFameRow[] | null)?.forEach((e) =>
    manualByYear.set(e.season_year, e)
  );

  const merged = new Map<number, MergedSeason>();

  // ESPN supplies the objective result for each completed season it covers.
  for (const season of espnHistory) {
    merged.set(season.seasonYear, {
      seasonYear: season.seasonYear,
      championTeam: season.championTeam,
      championManager: null,
      runnerUpTeam: season.runnerUpTeam,
      runnerUpManager: null,
      lastPlaceTeam: season.lastPlaceTeam,
      lastPlaceManager: null,
      punishment: null,
      notes: null,
      fromEspn: true,
    });
  }

  // Manual entries layer on top — they supply punishment/notes/manager,
  // and fill in (or override) the result for years ESPN doesn't cover.
  for (const [year, row] of manualByYear) {
    const existing = merged.get(year);
    merged.set(year, {
      seasonYear: year,
      championTeam: row.champion_team || existing?.championTeam || null,
      championManager: row.champion_manager || existing?.championManager || null,
      runnerUpTeam: row.runner_up_team || existing?.runnerUpTeam || null,
      runnerUpManager:
        row.runner_up_manager || existing?.runnerUpManager || null,
      lastPlaceTeam: row.last_place_team || existing?.lastPlaceTeam || null,
      lastPlaceManager:
        row.last_place_manager || existing?.lastPlaceManager || null,
      punishment: row.punishment,
      notes: row.notes,
      fromEspn: existing?.fromEspn ?? false,
    });
  }

  const seasons = Array.from(merged.values()).sort(
    (a, b) => b.seasonYear - a.seasonYear
  );

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-black uppercase tracking-tight text-neo-ink">
        🏅 Hall of Fame
      </h1>
      <p className="mb-6 text-sm text-neo-ink">
        Champions, punishments, and everything in between.
        {espnHistoryConfigured() && " Results marked ESPN sync automatically."}
      </p>

      {profile?.is_commissioner && (
        <div className="mb-8">
          <NewHallOfFameEntryForm />
          <p className="mt-2 text-xs text-neo-ink">
            Use this to add the punishment, notes, or manager name for a
            season — if ESPN already has the result for that year, you only
            need to fill in the extra details; the season year is enough to
            attach them.
          </p>
        </div>
      )}

      {seasons.length === 0 && (
        <p className="text-sm text-neo-ink">
          No history yet — add the first season above, or connect ESPN
          history in Setup for it to fill in automatically.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {seasons.map((entry) => (
          <Card key={entry.seasonYear}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight text-neo-ink">
                {entry.seasonYear} Season
              </h2>
              {entry.fromEspn && (
                <span className="border-4 border-neo-ink px-2 py-0.5 text-xs font-bold uppercase text-neo-ink">
                  ESPN sync
                </span>
              )}
            </div>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-neo-ink">🏆 Champion</dt>
                <dd className="text-neo-ink">
                  {entry.championTeam ?? "—"}
                  {entry.championManager && (
                    <span className="block text-xs text-neo-ink">
                      {entry.championManager}
                    </span>
                  )}
                </dd>
              </div>
              {entry.runnerUpTeam && (
                <div>
                  <dt className="text-neo-ink">🥈 Runner-up</dt>
                  <dd className="text-neo-ink">
                    {entry.runnerUpTeam}
                    {entry.runnerUpManager && (
                      <span className="block text-xs text-neo-ink">
                        {entry.runnerUpManager}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {entry.lastPlaceTeam && (
                <div>
                  <dt className="text-neo-ink">💩 Last place</dt>
                  <dd className="text-neo-ink">
                    {entry.lastPlaceTeam}
                    {entry.lastPlaceManager && (
                      <span className="block text-xs text-neo-ink">
                        {entry.lastPlaceManager}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {entry.punishment && (
                <div>
                  <dt className="text-neo-ink">Punishment</dt>
                  <dd className="text-neo-ink">{entry.punishment}</dd>
                </div>
              )}
            </dl>
            {entry.notes && (
              <p className="mt-3 text-sm text-neo-ink">{entry.notes}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
