"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewPollPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateOption(i: number, value: string) {
    setOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setError("Add at least two options.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({ question, created_by: user.id })
      .select()
      .single();

    if (pollError || !poll) {
      setError(pollError?.message ?? "Could not create poll.");
      setLoading(false);
      return;
    }

    const { error: optionsError } = await supabase.from("poll_options").insert(
      cleanOptions.map((option_text, position) => ({
        poll_id: poll.id,
        option_text,
        position,
      }))
    );

    setLoading(false);
    if (optionsError) {
      setError(optionsError.message);
      return;
    }

    router.push(`/polls/${poll.id}`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">New Poll</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Question</label>
          <input
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
            placeholder="Should we switch to PPR next season?"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Options</label>
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => (
              <input
                key={i}
                required={i < 2}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOptions((o) => [...o, ""])}
            className="mt-2 text-sm text-amber-400 hover:underline"
          >
            + Add option
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
}
