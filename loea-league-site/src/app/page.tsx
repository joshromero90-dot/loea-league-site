import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { CardLink, Card } from "@/components/Card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function Home() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: latestNote }, { data: openPolls }, { data: recentThreads }] =
    await Promise.all([
      supabase
        .from("notes")
        .select("id,title,created_at")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("polls")
        .select("id,question")
        .eq("is_closed", false)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("trade_threads")
        .select("id,title,created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          Welcome back{profile ? `, ${profile.display_name}` : ""} 🏆
        </h1>
        <p className="mt-1 text-slate-400">
          Everything for The League of Extraordinary Asshole, in one place.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardLink
          href="/standings"
          emoji="📊"
          title="Standings"
          description="Live scores and league standings."
        />
        <CardLink
          href="/polls"
          emoji="🗳️"
          title="Polls"
          description="Vote on league decisions."
        />
        <CardLink
          href="/notes"
          emoji="📌"
          title="Manager Notes"
          description="Announcements from the commissioner."
        />
        <CardLink
          href="/trade-board"
          emoji="🔄"
          title="Trade Board"
          description="Pitch and discuss trades."
        />
        <CardLink
          href="/news"
          emoji="📰"
          title="News"
          description="Latest NFL & fantasy football news."
        />
        <CardLink
          href="/resources"
          emoji="🔗"
          title="Links & Resources"
          description="Rankings, tools, and cheat sheets."
        />
        <CardLink
          href="/rules"
          emoji="📜"
          title="Rules"
          description="League constitution & scoring."
        />
        <CardLink
          href="/history"
          emoji="🏅"
          title="Hall of Fame"
          description="Champions, punishments, and shame."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-100">Latest Note</h2>
          {latestNote ? (
            <Link
              href="/notes"
              className="text-sm text-amber-400 hover:underline"
            >
              {latestNote.title}
            </Link>
          ) : (
            <p className="text-sm text-slate-500">No notes yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-100">Open Polls</h2>
          {openPolls && openPolls.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {openPolls.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/polls/${p.id}`}
                    className="text-sm text-amber-400 hover:underline"
                  >
                    {p.question}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No open polls.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-100">
            Recent Trade Talk
          </h2>
          {recentThreads && recentThreads.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {recentThreads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/trade-board/${t.id}`}
                    className="text-sm text-amber-400 hover:underline"
                  >
                    {t.title}
                  </Link>{" "}
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(t.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No trade discussions yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
