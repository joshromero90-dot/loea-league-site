import Parser from "rss-parser";
import { formatDistanceToNow } from "date-fns";
import {
  espnConfigured,
  getEspnRecentActivity,
  type EspnActivityItem,
} from "@/lib/espn";

export const revalidate = 900; // refresh every 15 minutes

const FEEDS = [
  { name: "ESPN NFL", url: "https://www.espn.com/espn/rss/nfl/news" },
  {
    name: "CBS Sports NFL",
    url: "https://www.cbssports.com/rss/headlines/nfl/",
  },
];

type NewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate?: string;
};

async function getNews(): Promise<NewsItem[]> {
  const parser = new Parser();
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).slice(0, 12).map((item) => ({
        title: item.title ?? "",
        link: item.link ?? "",
        source: feed.name,
        pubDate: item.pubDate,
      }));
    })
  );

  const items = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : []
  );

  return items.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });
}

const ACTIVITY_LABELS: Record<EspnActivityItem["kind"], string> = {
  trade: "🔄 Trade",
  waiver: "📝 Waiver Claim",
  add: "➕ Free Agent Add",
  drop: "➖ Drop",
};

export default async function NewsPage() {
  let news: NewsItem[] = [];
  let newsFailed = false;
  try {
    news = await getNews();
  } catch {
    newsFailed = true;
  }

  const hasEspn = espnConfigured();
  let activity: EspnActivityItem[] = [];
  if (hasEspn) {
    try {
      activity = await getEspnRecentActivity();
    } catch {
      activity = [];
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-black uppercase tracking-tight text-slate-100">
        📰 News
      </h1>
      <p className="mb-8 text-sm text-slate-500">
        League moves straight from ESPN, plus the wider NFL wire.
      </p>

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-black uppercase tracking-tight text-slate-100">
          😈 Asshole News
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Trades, waiver claims, and pickups — auto-synced from ESPN&apos;s
          Recent Activity.
        </p>

        {!hasEspn && (
          <p className="text-sm text-slate-500">
            League activity isn&apos;t connected yet. Add{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5">
              ESPN_LEAGUE_ID
            </code>{" "}
            and{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5">
              ESPN_SEASON_YEAR
            </code>{" "}
            to your environment variables to see it here.
          </p>
        )}

        {hasEspn && activity.length === 0 && (
          <p className="text-sm text-slate-500">
            No recent moves yet — check back after the next waiver run.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {activity.map((item) => (
            <div
              key={item.id}
              className="border-2 border-slate-800 bg-slate-900 p-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-amber-500">
                {ACTIVITY_LABELS[item.kind]}
              </p>
              <p className="mt-1 text-slate-100">{item.summary}</p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDistanceToNow(new Date(item.date), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-black uppercase tracking-tight text-slate-100">
          🏈 NFL News
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Auto-updated from ESPN and CBS Sports.
        </p>

        {newsFailed && (
          <p className="text-sm text-red-400">
            Couldn&apos;t load news right now — try again shortly.
          </p>
        )}

        {!newsFailed && news.length === 0 && (
          <p className="text-sm text-slate-500">No headlines available.</p>
        )}

        <div className="flex flex-col gap-3">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block border-2 border-slate-800 bg-slate-900 p-4 transition hover:border-amber-500/60"
            >
              <p className="font-medium text-slate-100">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {item.source}
                {item.pubDate &&
                  ` · ${formatDistanceToNow(new Date(item.pubDate), {
                    addSuffix: true,
                  })}`}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
