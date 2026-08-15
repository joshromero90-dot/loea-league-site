"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditableContent({
  slug,
  initialBody,
  canEdit,
}: {
  slug: string;
  initialBody: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("site_content")
      .update({ body, updated_by: user?.id, updated_at: new Date().toISOString() })
      .eq("slug", slug);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-amber-500"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={loading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => {
              setBody(initialBody);
              setEditing(false);
            }}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="prose-league rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-200">
        {body || "Nothing here yet."}
      </div>
      {canEdit && (
        <button
          onClick={() => setEditing(true)}
          className="mt-3 text-sm text-amber-400 hover:underline"
        >
          Edit
        </button>
      )}
    </div>
  );
}
