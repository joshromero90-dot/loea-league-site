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

  const { data: rawVotes } = await supabase
    .from("poll_votes")
    .select("option_id,voter_id,profiles(display_name)")
    .eq("poll_id", id);

  type VoteRow = {
    option_id: string;
    voter_id: string;
    profiles: { display_name: string } | null;
  };
  const votes = (rawVotes ?? []) as unknown as VoteRow[];

  const voteCounts = new Map<string, number>();
  votes.forEach((v) => {
    voteCounts.set(v.option_id, (voteCounts.get(v.option_id) ?? 0) + 1);
  });

  const myVote = votes.find((v) => v.voter_id === profile?.id);

  const optionsWithCounts = (options ?? []).map((o) => ({
    id: o.id,
    option_text: o.option_text,
    votes: voteCounts.get(o.id) ?? 0,
    voters: profile?.is_commissioner
      ? votes
          .filter((v) => v.option_id === o.id)
          .map((v) => v.profiles?.display_name ?? "Unknown")
      : undefined,
  }));

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-black uppercase tracking-tight text-slate-100">
        {poll.question}
      </h1>
      <p className="mb-6 text-xs text-slate-500">
        {poll.is_closed ? "Closed" : "Open"} ·{" "}
        {new Date(poll.created_at).toLocaleDateString()}
      </p>

      <PollVoteForm
        pollId={poll.id}
        options={optionsWithCounts}
        totalVotes={votes.length}
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
