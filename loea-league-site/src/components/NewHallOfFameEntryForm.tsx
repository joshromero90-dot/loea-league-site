"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewHallOfFameEntryForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear());
  const [championTeam, setChampionTeam] = useState("");
  const [championManager, setChampionManager] = useState("");
  const [runnerUp, setRunnerUp] = useState("");
  const [runnerUpManager, setRunnerUpManager] = useState("");
  const [lastPlace, setLastPlace] = useState("");
  const [lastPlaceManager, setLastPlaceManager] = useState("");
  const [punishment, setPunishment] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("hall_of_fame").insert({
      season_year: seasonYear,
      champion_team: championTeam || null,
      champion_manager: championManager || null,
      runner_up_team: runnerUp || null,
      runner_up_manager: runnerUpManager || null,
      last_place_team: lastPlace || null,
      last_place_manager: lastPlaceManager || null,
      punishment: punishment || null,
      notes: notes || null,
      created_by: user.id,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setChampionTeam("");
    setChampionManager("");
    setRunnerUp("");
    setRunnerUpManager("");
    setLastPlace("");
    setLastPlaceManager("");
    setPunishment("");
    setNotes("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
      >
        + Add a season
      </button>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <div>
        <label className="mb-1 block text-sm text-slate-300">Season year</label>
        <input
          type="number"
          required
          value={seasonYear}
          onChange={(e) => setSeasonYear(Number(e.target.value))}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Champion team (leave blank if ESPN already has this season)
        </label>
        <input
          value={championTeam}
          onChange={(e) => setChampionTeam(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Champion manager (optional)
        </label>
        <input
          value={championManager}
          onChange={(e) => setChampionManager(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Runner-up (optional)
        </label>
        <input
          value={runnerUp}
          onChange={(e) => setRunnerUp(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Runner-up manager (optional)
        </label>
        <input
          value={runnerUpManager}
          onChange={(e) => setRunnerUpManager(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Last place (optional)
        </label>
        <input
          value={lastPlace}
          onChange={(e) => setLastPlace(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Last place manager (optional)
        </label>
        <input
          value={lastPlaceManager}
          onChange={(e) => setLastPlaceManager(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Punishment (optional)
        </label>
        <input
          value={punishment}
          onChange={(e) => setPunishment(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save season"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
