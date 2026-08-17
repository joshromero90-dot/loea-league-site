"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/profile";

export default function EditProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [teamName, setTeamName] = useState(profile.team_name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!displayName.trim()) {
      setError("Display name can't be empty.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        team_name: teamName.trim() || null,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Display Name
        </label>
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Team Name
        </label>
        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g. The Gridiron Gremlins"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-amber-400">Saved.</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <p className="text-xs text-slate-500">
        Want to link or change your ESPN team for the lineup viewer? Head to
        the{" "}
        <Link href="/managers" className="text-amber-400 hover:underline">
          Managers page
        </Link>
        .
      </p>
    </form>
  );
}
