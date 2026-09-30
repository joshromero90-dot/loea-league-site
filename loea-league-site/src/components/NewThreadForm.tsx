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
        className="bg-neo-red px-4 py-2 text-sm font-bold text-neo-ink hover:bg-neo-yellow"
      >
        + Start a trade thread
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border-4 border-neo-ink bg-white p-5"
    >
      <input
        required
        placeholder="e.g. Looking to trade my RB2 for a WR1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
      />
      <textarea
        placeholder="Details (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
      />
      {error && <p className="text-sm text-neo-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-neo-red px-4 py-2 text-sm font-bold text-neo-ink hover:bg-neo-yellow disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post thread"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border-4 border-neo-ink px-4 py-2 text-sm text-neo-ink hover:bg-neo-violet"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
