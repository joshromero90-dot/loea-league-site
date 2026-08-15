import Parser from "rss-parser";
import { formatDistanceToNow } from "date-fns";

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

export default async function NewsPage() {
  let news: NewsItem[] = [];
  let failed = false;
  try {
    news = await getNews();
  } catch {
    failed = true;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-100">📰 NFL News</h1>
      <p className="mb-6 text-sm text-slate-500">
        Auto-updated from ESPN and CBS Sports.
      </p>

      {failed && (
        <p className="text-sm text-red-400">
          Couldn&apos;t load news right now — try again shortly.
        </p>
      )}

      {!failed && news.length === 0 && (
        <p className="text-sm text-slate-500">No headlines available.</p>
      )}

      <div className="flex flex-col gap-3">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-slate-800 bg-slate-900/60 p-4 transition hover:border-amber-500/60"
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
    </div>
  );
}
