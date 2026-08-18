"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewThreadForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
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

    const { data: thread, error: threadError } = await supabase
      .from("trade_threads")
      .insert({ title, created_by: user.id })
      .select()
      .single();

    if (threadError || !thread) {
      setError(threadError?.message ?? "Could not start thread.");
      setLoading(false);
      return;
    }

    if (message.trim()) {
      await supabase.from("trade_messages").insert({
        thread_id: thread.id,
        author_id: user.id,
        body: message.trim(),
      });
    }

    setLoading(false);
    router.push(`/trade-board/${thread.id}`);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
      >
        + Start a trade thread
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
        placeholder="e.g. Looking to trade my RB2 for a WR1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
      />
      <textarea
        placeholder="Details (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post thread"}
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
