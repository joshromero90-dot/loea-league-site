import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { Card } from "@/components/Card";
import NewHallOfFameEntryForm from "@/components/NewHallOfFameEntryForm";

export default async function HistoryPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: entries } = await supabase
    .from("hall_of_fame")
    .select("*")
    .order("season_year", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-100">
        🏅 Hall of Fame
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Champions, punishments, and everything in between.
      </p>

      {profile?.is_commissioner && (
        <div className="mb-8">
          <NewHallOfFameEntryForm />
        </div>
      )}

      {(!entries || entries.length === 0) && (
        <p className="text-sm text-slate-500">
          No history recorded yet — add the first season above.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {entries?.map((entry) => (
          <Card key={entry.id}>
            <h2 className="text-lg font-bold text-amber-400">
              {entry.season_year} Season
            </h2>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">🏆 Champion</dt>
                <dd className="text-slate-100">
                  {entry.champion_team}
                  {entry.champion_manager && ` (${entry.champion_manager})`}
                </dd>
              </div>
              {entry.runner_up_team && (
                <div>
                  <dt className="text-slate-500">🥈 Runner-up</dt>
                  <dd className="text-slate-100">{entry.runner_up_team}</dd>
                </div>
              )}
              {entry.last_place_team && (
                <div>
                  <dt className="text-slate-500">💩 Last place</dt>
                  <dd className="text-slate-100">{entry.last_place_team}</dd>
                </div>
              )}
              {entry.punishment && (
                <div>
                  <dt className="text-slate-500">Punishment</dt>
                  <dd className="text-slate-100">{entry.punishment}</dd>
                </div>
              )}
            </dl>
            {entry.notes && (
              <p className="mt-3 text-sm text-slate-300">{entry.notes}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
