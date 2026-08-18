"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewNoteForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
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
    const { error } = await supabase
      .from("notes")
      .insert({ title, body, pinned, author_id: user.id });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTitle("");
    setBody("");
    setPinned(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
      >
        + Post a note
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border-2 border-slate-800 bg-slate-900 p-5"
    >
      <input
        required
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
      />
      <textarea
        required
        placeholder="Write your announcement..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
      />
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
        />
        Pin to top
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border-2 border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
