import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/Card";
import type { Profile } from "@/lib/profile";

export default async function ManagersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  const managers = (profiles as Profile[] | null) ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">🙋 Managers</h1>
        <p className="mt-1 text-sm text-slate-400">
          {managers.length} manager{managers.length === 1 ? "" : "s"} signed
          up so far.
        </p>
      </div>

      {managers.length === 0 ? (
        <p className="text-sm text-slate-500">No one has signed up yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {managers.map((manager) => (
            <Card key={manager.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-100">
                    {manager.display_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {manager.team_name || "No team name set"}
                  </p>
                </div>
                {manager.is_commissioner && (
                  <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                    Commissioner
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
