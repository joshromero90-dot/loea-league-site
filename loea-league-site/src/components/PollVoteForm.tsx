"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Option = {
  id: string;
  option_text: string;
  votes: number;
  voters?: string[];
};

export default function PollVoteForm({
  pollId,
  options,
  totalVotes,
  myVoteOptionId,
  isClosed,
}: {
  pollId: string;
  options: Option[];
  totalVotes: number;
  myVoteOptionId: string | null;
  isClosed: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function vote(optionId: string) {
    if (isClosed) return;
    setError(null);
    setLoading(optionId);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setLoading(null);
      return;
    }

    const { error } = await supabase.from("poll_votes").upsert(
      { poll_id: pollId, option_id: optionId, voter_id: user.id },
      { onConflict: "poll_id,voter_id" }
    );

    setLoading(null);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
        const isMine = myVoteOptionId === opt.id;
        return (
          <div key={opt.id} className="flex flex-col gap-1">
            <button
              onClick={() => vote(opt.id)}
              disabled={isClosed || loading !== null}
              className={`relative w-full overflow-hidden border-2 px-4 py-3 text-left transition disabled:cursor-default ${
                isMine ? "border-amber-500" : "border-slate-700 hover:border-amber-500"
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-yellow-400/50"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between">
                <span className="text-slate-100">
                  {opt.option_text} {isMine && "✓"}
                </span>
                <span className="text-sm text-slate-400">
                  {loading === opt.id ? "Voting..." : `${pct}% (${opt.votes})`}
                </span>
              </div>
            </button>
            {opt.voters && opt.voters.length > 0 && (
              <p className="pl-1 text-xs text-slate-500">
                Voted by: {opt.voters.join(", ")}
              </p>
            )}
          </div>
        );
      })}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="text-xs text-slate-500">
        {totalVotes} total vote(s){" "}
        {myVoteOptionId && !isClosed && "· tap another option to change your vote"}
        {isClosed && "· poll closed"}
      </p>
    </div>
  );
}
