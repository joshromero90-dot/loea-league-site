import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import ReplyForm from "@/components/ReplyForm";
import CloseThreadButton from "@/components/CloseThreadButton";
import { formatDistanceToNow } from "date-fns";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: thread } = await supabase
    .from("trade_threads")
    .select("id,title,is_closed,created_by,created_at,profiles(display_name)")
    .eq("id", id)
    .single();

  if (!thread) notFound();
  const starter = Array.isArray(thread.profiles)
    ? thread.profiles[0]
    : thread.profiles;

  const { data: messages } = await supabase
    .from("trade_messages")
    .select("id,body,created_at,author_id,profiles(display_name)")
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  const canClose = profile?.id === thread.created_by || profile?.is_commissioner;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-100">{thread.title}</h1>
        <p className="mt-1 text-xs text-slate-500">
          Started by {starter?.display_name ?? "a manager"} ·{" "}
          {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
          {thread.is_closed && " · closed"}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        {(!messages || messages.length === 0) && (
          <p className="text-sm text-slate-500">No replies yet.</p>
        )}
        {messages?.map((m) => {
          const author = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
          return (
            <div
              key={m.id}
              className="border-2 border-slate-800 bg-slate-900 p-4"
            >
              <p className="text-sm text-slate-200">{m.body}</p>
              <p className="mt-2 text-xs text-slate-500">
                {author?.display_name ?? "Manager"} ·{" "}
                {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
              </p>
            </div>
          );
        })}
      </div>

      {!thread.is_closed ? (
        <ReplyForm threadId={thread.id} />
      ) : (
        <p className="text-sm text-slate-500">This thread is closed.</p>
      )}

      {canClose && !thread.is_closed && (
        <div className="mt-4">
          <CloseThreadButton threadId={thread.id} />
        </div>
      )}
    </div>
  );
}
