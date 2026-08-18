import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import NewResourceForm from "@/components/NewResourceForm";
import DeleteResourceButton from "@/components/DeleteResourceButton";

export default async function ResourcesPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: resources } = await supabase
    .from("resources")
    .select("id,title,url,description,category,added_by,profiles(display_name)")
    .order("category")
    .order("created_at", { ascending: false });

  const byCategory = new Map<string, typeof resources>();
  resources?.forEach((r) => {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-black uppercase tracking-tight text-slate-100">
        🔗 Links & Resources
      </h1>

      <div className="mb-8">
        <NewResourceForm />
      </div>

      {byCategory.size === 0 && (
        <p className="text-sm text-slate-500">
          No links yet — add rankings, cheat sheets, or tools above.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {Array.from(byCategory.entries()).map(([category, items]) => (
          <div key={category}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {category}
            </h2>
            <div className="flex flex-col gap-2">
              {items?.map((r) => {
                const author = Array.isArray(r.profiles)
                  ? r.profiles[0]
                  : r.profiles;
                const canDelete =
                  profile?.id === r.added_by || profile?.is_commissioner;
                return (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-3 border-2 border-slate-800 bg-slate-900 p-4"
                  >
                    <div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-amber-400 hover:underline"
                      >
                        {r.title}
                      </a>
                      {r.description && (
                        <p className="mt-1 text-sm text-slate-400">
                          {r.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        Added by {author?.display_name ?? "a manager"}
                      </p>
                    </div>
                    {canDelete && <DeleteResourceButton resourceId={r.id} />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
