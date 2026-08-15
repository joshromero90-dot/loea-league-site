import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import EditableContent from "@/components/EditableContent";

export default async function RulesPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: content } = await supabase
    .from("site_content")
    .select("title,body")
    .eq("slug", "rules")
    .single();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">
        📜 {content?.title ?? "League Rules & Constitution"}
      </h1>
      <EditableContent
        slug="rules"
        initialBody={content?.body ?? ""}
        canEdit={!!profile?.is_commissioner}
      />
    </div>
  );
}
