import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { Card } from "@/components/Card";
import NewNoteForm from "@/components/NewNoteForm";
import { formatDistanceToNow } from "date-fns";

export default async function NotesPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: notes } = await supabase
    .from("notes")
    .select("id,title,body,pinned,created_at,author_id,profiles(display_name)")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">
        📌 Manager Notes
      </h1>

      {profile?.is_commissioner && (
        <div className="mb-8">
          <NewNoteForm />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {(!notes || notes.length === 0) && (
          <p className="text-sm text-slate-500">
            No announcements yet. Check back soon.
          </p>
        )}
        {notes?.map((note) => {
          const author = Array.isArray(note.profiles)
            ? note.profiles[0]
            : note.profiles;
          return (
            <Card key={note.id}>
              <div className="mb-1 flex items-center gap-2">
                {note.pinned && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                    Pinned
                  </span>
                )}
                <h2 className="font-semibold text-slate-100">{note.title}</h2>
              </div>
              <p className="prose-league text-sm text-slate-300">{note.body}</p>
              <p className="mt-3 text-xs text-slate-500">
                {author?.display_name ?? "Commissioner"} ·{" "}
                {formatDistanceToNow(new Date(note.created_at), {
                  addSuffix: true,
                })}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
