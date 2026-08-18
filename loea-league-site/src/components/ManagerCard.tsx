"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "./Card";

export type ManagerProfile = {
  id: string;
  display_name: string;
  team_name: string | null;
  is_commissioner: boolean;
  espn_team_id: number | null;
};

type EspnTeamOption = { id: number; name: string; abbrev: string };

type RosterPlayer = {
  playerId: number;
  name: string;
  slot: string;
  isStarter: boolean;
  injuryStatus?: string;
};

export default function ManagerCard({
  manager,
  isOwnProfile,
  espnTeams,
  espnConfigured,
}: {
  manager: ManagerProfile;
  isOwnProfile: boolean;
  espnTeams: EspnTeamOption[];
  espnConfigured: boolean;
}) {
  const router = useRouter();

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const [lineupOpen, setLineupOpen] = useState(false);
  const [roster, setRoster] = useState<RosterPlayer[] | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);

  async function saveTeamLink() {
    if (!selectedTeamId) return;
    setLinking(true);
    setLinkError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ espn_team_id: Number(selectedTeamId) })
      .eq("id", manager.id);
    setLinking(false);
    if (error) {
      setLinkError(error.message);
      return;
    }
    router.refresh();
  }

  async function toggleLineup() {
    if (lineupOpen) {
      setLineupOpen(false);
      return;
    }
    setLineupOpen(true);
    if (roster !== null || !manager.espn_team_id) return;
    setRosterLoading(true);
    setRosterError(null);
    try {
      const res = await fetch(
        `/api/espn-roster?teamId=${manager.espn_team_id}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't load lineup.");
      setRoster(data.roster as RosterPlayer[]);
    } catch (err) {
      setRosterError(
        err instanceof Error ? err.message : "Couldn't load lineup."
      );
    } finally {
      setRosterLoading(false);
    }
  }

  return (
    <Card>
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
          <span className="shrink-0 border-2 border-slate-800 bg-yellow-400 px-2 py-0.5 text-xs font-bold uppercase text-slate-100">
            Commissioner
          </span>
        )}
      </div>

      {espnConfigured && (
        <div className="mt-4 border-t border-slate-800 pt-3">
          {manager.espn_team_id ? (
            <>
              <button
                type="button"
                onClick={toggleLineup}
                className="text-sm text-amber-400 hover:underline"
              >
                {lineupOpen ? "Hide lineup" : "View lineup"}
              </button>

              {lineupOpen && (
                <div className="mt-3">
                  {rosterLoading && (
                    <p className="text-xs text-slate-500">Loading...</p>
                  )}
                  {rosterError && (
                    <p className="text-xs text-red-400">{rosterError}</p>
                  )}
                  {!rosterLoading && !rosterError && roster?.length === 0 && (
                    <p className="text-xs text-slate-500">
                      Rosters aren&apos;t set yet — check back after the
                      draft.
                    </p>
                  )}
                  {!rosterLoading && roster && roster.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {roster.map((p) => (
                        <li
                          key={p.playerId}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span
                            className={
                              p.isStarter ? "text-slate-200" : "text-slate-500"
                            }
                          >
                            {p.name}
                            {p.injuryStatus && (
                              <span className="ml-1 text-red-400">
                                {p.injuryStatus}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-slate-500">
                            {p.slot}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          ) : isOwnProfile ? (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400">
                Link your ESPN team to show your lineup here
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="flex-1 border-2 border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                >
                  <option value="">Select your team...</option>
                  {espnTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={saveTeamLink}
                  disabled={!selectedTeamId || linking}
                  className="bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {linking ? "Saving..." : "Link"}
                </button>
              </div>
              {linkError && (
                <p className="text-xs text-red-400">{linkError}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Hasn&apos;t linked their ESPN team yet.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
