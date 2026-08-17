import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { espnConfigured, getEspnStandings } from "@/lib/espn";
import ManagerCard, { type ManagerProfile } from "@/components/ManagerCard";

export default async function ManagersPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,display_name,team_name,is_commissioner,espn_team_id")
    .order("created_at", { ascending: true });

  const managers = (profiles as ManagerProfile[] | null) ?? [];

  const hasEspn = espnConfigured();
  let espnTeams: { id: number; name: string; abbrev: string }[] = [];

  if (hasEspn) {
    try {
      const standings = await getEspnStandings();
      espnTeams = standings.teams.map((t) => ({
        id: t.id,
        name: t.name,
        abbrev: t.abbrev,
      }));
    } catch {
      espnTeams = [];
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">🙋 Managers</h1>
        <p className="mt-1 text-sm text-slate-400">
          {managers.length} manager{managers.length === 1 ? "" : "s"} signed
          up so far.
          {hasEspn &&
            " Link your ESPN team below to show your lineup once the draft happens."}
        </p>
      </div>

      {managers.length === 0 ? (
        <p className="text-sm text-slate-500">No one has signed up yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {managers.map((manager) => (
            <ManagerCard
              key={manager.id}
              manager={manager}
              isOwnProfile={manager.id === profile?.id}
              espnTeams={espnTeams}
              espnConfigured={hasEspn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
