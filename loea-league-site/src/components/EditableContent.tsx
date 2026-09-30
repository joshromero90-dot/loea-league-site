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
          className="w-full border-4 border-neo-ink bg-neo-paper px-3 py-2 font-mono text-sm text-neo-ink outline-none focus:border-neo-ink"
        />
        {error && <p className="text-sm text-neo-error">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={loading}
            className="bg-neo-accent px-4 py-2 text-sm font-bold text-neo-ink hover:bg-neo-highlight disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => {
              setBody(initialBody);
              setEditing(false);
            }}
            className="border-4 border-neo-ink px-4 py-2 text-sm text-neo-ink hover:bg-neo-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="prose-league border-4 border-neo-ink bg-neo-paper p-5 text-sm text-neo-ink">
        {body || "Nothing here yet."}
      </div>
      {canEdit && (
        <button
          onClick={() => setEditing(true)}
          className="mt-3 text-sm text-neo-ink hover:underline"
        >
          Edit
        </button>
      )}
    </div>
  );
}
