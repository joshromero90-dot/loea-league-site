import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/Card";
import NewThreadForm from "@/components/NewThreadForm";
import { formatDistanceToNow } from "date-fns";

export default async function TradeBoardPage() {
  const supabase = await createClient();

  const { data: threads } = await supabase
    .from("trade_threads")
    .select(
      "id,title,is_closed,created_at,profiles(display_name), trade_messages(count)"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-black uppercase tracking-tight text-slate-100">
        🔄 Trade Board
      </h1>

      <div className="mb-8">
        <NewThreadForm />
      </div>

      <div className="flex flex-col gap-3">
        {(!threads || threads.length === 0) && (
          <p className="text-sm text-slate-500">
            No trade talk yet. Start a thread above.
          </p>
        )}
        {threads?.map((thread) => {
          const author = Array.isArray(thread.profiles)
            ? thread.profiles[0]
            : thread.profiles;
          return (
            <Link key={thread.id} href={`/trade-board/${thread.id}`}>
              <Card className="transition hover:border-amber-500/60">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-100">
                    {thread.title}
                    {thread.is_closed && (
                      <span className="ml-2 text-xs text-slate-500">
                        (closed)
                      </span>
                    )}
                  </p>
                  <span className="text-xs text-slate-500">
                    {thread.trade_messages?.[0]?.count ?? 0} replies
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Started by {author?.display_name ?? "a manager"} ·{" "}
                  {formatDistanceToNow(new Date(thread.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
