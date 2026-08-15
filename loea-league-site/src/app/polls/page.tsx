import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { Card } from "@/components/Card";

export default async function PollsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: polls } = await supabase
    .from("polls")
    .select("id,question,is_closed,created_at, poll_votes(count)")
    .order("created_at", { ascending: false });

  const open = polls?.filter((p) => !p.is_closed) ?? [];
  const closed = polls?.filter((p) => p.is_closed) ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">🗳️ Polls</h1>
        {profile?.is_commissioner && (
          <Link
            href="/polls/new"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
          >
            + New Poll
          </Link>
        )}
      </div>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Open
      </h2>
      <div className="mb-8 flex flex-col gap-3">
        {open.length === 0 && (
          <p className="text-sm text-slate-500">No open polls right now.</p>
        )}
        {open.map((poll) => (
          <Link key={poll.id} href={`/polls/${poll.id}`}>
            <Card className="transition hover:border-amber-500/60">
              <p className="font-medium text-slate-100">{poll.question}</p>
              <p className="mt-1 text-xs text-slate-500">
                {poll.poll_votes?.[0]?.count ?? 0} vote(s)
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {closed.length > 0 && (
        <>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Closed
          </h2>
          <div className="flex flex-col gap-3">
            {closed.map((poll) => (
              <Link key={poll.id} href={`/polls/${poll.id}`}>
                <Card className="opacity-70 transition hover:border-amber-500/60 hover:opacity-100">
                  <p className="font-medium text-slate-100">{poll.question}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {poll.poll_votes?.[0]?.count ?? 0} vote(s) · closed
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
