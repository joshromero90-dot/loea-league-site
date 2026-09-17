import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { Card } from "@/components/Card";
import NewNoteForm from "@/components/NewNoteForm";
import TogglePinButton from "@/components/TogglePinButton";
import { format } from "date-fns";

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
      <h1 className="mb-6 text-2xl font-black uppercase tracking-tight text-slate-100">
        📌 Commissioner Notes
      </h1>
      <p className="mb-6 -mt-4 text-sm text-slate-500">
        A running log of every note posted, newest first. Older notes
        collapse — hover one to read it.
      </p>

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
        {notes?.map((note, i) => {
          const author = Array.isArray(note.profiles)
            ? note.profiles[0]
            : note.profiles;
          const meta = (
            <p className="text-xs text-slate-500">
              {format(new Date(note.created_at), "MMMM d, yyyy")} ·{" "}
              {author?.display_name ?? "Commissioner"}
            </p>
          );
          const titleRow = (
            <div className="mb-1 flex items-center gap-2">
              {note.pinned && (
                <span className="border-2 border-slate-800 bg-yellow-400 px-2 py-0.5 text-xs font-bold uppercase text-slate-100">
                  Pinned
                </span>
              )}
              <h2 className="font-semibold text-slate-100">{note.title}</h2>
            </div>
          );

          // The newest note (top of the list) always shows in full. Every
          // note after that is "previous" — it collapses to just the title
          // and only reveals its body on hover, with a red accent border as
          // the cue that it's interactive.
          if (i === 0) {
            return (
              <Card key={note.id}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  {meta}
                  {profile?.is_commissioner && (
                    <TogglePinButton noteId={note.id} pinned={note.pinned} />
                  )}
                </div>
                {titleRow}
                <p className="prose-league text-sm text-slate-300">
                  {note.body}
                </p>
              </Card>
            );
          }

          return (
            <div key={note.id} className="group border-2 border-slate-800 bg-slate-900 p-5 transition-colors hover:border-amber-500">
              <div className="mb-2 flex items-center justify-between gap-2">
                {meta}
                {profile?.is_commissioner && (
                  <TogglePinButton noteId={note.id} pinned={note.pinned} />
                )}
              </div>
              {titleRow}
              <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
                <div className="overflow-hidden">
                  <p className="prose-league pt-2 text-sm text-slate-300">
                    {note.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
