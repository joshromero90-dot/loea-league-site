import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import PollVoteForm from "@/components/PollVoteForm";
import ClosePollButton from "@/components/ClosePollButton";

export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: poll } = await supabase
    .from("polls")
    .select("id,question,is_closed,created_at")
    .eq("id", id)
    .single();

  if (!poll) notFound();

  const { data: options } = await supabase
    .from("poll_options")
    .select("id,option_text,position")
    .eq("poll_id", id)
    .order("position");

  const { data: votes } = await supabase
    .from("poll_votes")
    .select("option_id,voter_id")
    .eq("poll_id", id);

  const voteCounts = new Map<string, number>();
  votes?.forEach((v) => {
    voteCounts.set(v.option_id, (voteCounts.get(v.option_id) ?? 0) + 1);
  });

  const myVote = votes?.find((v) => v.voter_id === profile?.id);

  const optionsWithCounts = (options ?? []).map((o) => ({
    id: o.id,
    option_text: o.option_text,
    votes: voteCounts.get(o.id) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-100">
        {poll.question}
      </h1>
      <p className="mb-6 text-xs text-slate-500">
        {poll.is_closed ? "Closed" : "Open"} ·{" "}
        {new Date(poll.created_at).toLocaleDateString()}
      </p>

      <PollVoteForm
        pollId={poll.id}
        options={optionsWithCounts}
        totalVotes={votes?.length ?? 0}
        myVoteOptionId={myVote?.option_id ?? null}
        isClosed={poll.is_closed}
      />

      {profile?.is_commissioner && !poll.is_closed && (
        <div className="mt-6">
          <ClosePollButton pollId={poll.id} />
        </div>
      )}
    </div>
  );
}
