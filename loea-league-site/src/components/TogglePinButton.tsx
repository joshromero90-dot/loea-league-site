"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TogglePinButton({
  noteId,
  pinned,
}: {
  noteId: string;
  pinned: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("notes")
      .update({ pinned: !pinned })
      .eq("id", noteId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="text-xs font-bold uppercase text-amber-500 transition hover:underline disabled:opacity-50"
    >
      {loading ? "..." : pinned ? "Unpin" : "Pin"}
    </button>
  );
}
