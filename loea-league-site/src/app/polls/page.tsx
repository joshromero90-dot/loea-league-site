import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { Card } from "@/components/Card";
import PollVoteForm from "@/components/PollVoteForm";

export default async function PollsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: polls } = await supabase
    .from("polls")
    .select("id,question,is_closed,created_at, poll_votes(count)")
    .order("created_at", { ascending: false });

  const open = polls?.filter((p) => !p.is_closed) ?? [];
  const closed = polls?.filter((p) => p.is_closed) ?? [];

  const openIds = open.map((p) => p.id);

  const [{ data: allOptions }, { data: allVotes }] = await Promise.all([
    openIds.length > 0
      ? supabase
          .from("poll_options")
          .select("id,option_text,position,poll_id")
          .in("poll_id", openIds)
          .order("position")
      : Promise.resolve({ data: [] as never[] }),
    openIds.length > 0
      ? supabase
          .from("poll_votes")
          .select("poll_id,option_id,voter_id,profiles(display_name)")
          .in("poll_id", openIds)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  type VoteRow = {
    poll_id: string;
    option_id: string;
    voter_id: string;
    profiles: { display_name: string } | null;
  };
  const votes = (allVotes ?? []) as unknown as VoteRow[];

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
      <div className="mb-8 flex flex-col gap-6">
        {open.length === 0 && (
          <p className="text-sm text-slate-500">No open polls right now.</p>
        )}
        {open.map((poll) => {
          const pollOptions = (allOptions ?? []).filter(
            (o) => o.poll_id === poll.id
          );
          const pollVotes = votes.filter((v) => v.poll_id === poll.id);

          const voteCounts = new Map<string, number>();
          pollVotes.forEach((v) => {
            voteCounts.set(v.option_id, (voteCounts.get(v.option_id) ?? 0) + 1);
          });

          const myVote = pollVotes.find((v) => v.voter_id === profile?.id);

          const optionsWithCounts = pollOptions.map((o) => ({
            id: o.id,
            option_text: o.option_text,
            votes: voteCounts.get(o.id) ?? 0,
            voters: profile?.is_commissioner
              ? pollVotes
                  .filter((v) => v.option_id === o.id)
                  .map((v) => v.profiles?.display_name ?? "Unknown")
              : undefined,
          }));

          return (
            <Card key={poll.id}>
              <p className="mb-4 font-medium text-slate-100">
                {poll.question}
              </p>
              <PollVoteForm
                pollId={poll.id}
                options={optionsWithCounts}
                totalVotes={pollVotes.length}
                myVoteOptionId={myVote?.option_id ?? null}
                isClosed={false}
              />
            </Card>
          );
        })}
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
