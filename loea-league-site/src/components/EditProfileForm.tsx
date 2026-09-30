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
        <label className="mb-1 block text-sm text-neo-ink">
          Display Name
        </label>
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-neo-ink">
          Team Name
        </label>
        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g. The Gridiron Gremlins"
          className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
        />
      </div>

      {error && <p className="text-sm text-neo-error">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-neo-ink">Saved.</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-neo-red px-4 py-2 font-bold text-neo-ink transition hover:bg-neo-yellow disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <p className="text-xs text-neo-ink">
        Want to link or change your ESPN team for the lineup viewer? Head to
        the{" "}
        <Link href="/managers" className="text-neo-ink hover:underline">
          Managers page
        </Link>
        .
      </p>
    </form>
  );
}
