"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteResourceButton({
  resourceId,
}: {
  resourceId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("resources").delete().eq("id", resourceId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      disabled={loading}
      className="text-xs text-slate-500 hover:text-red-400 disabled:opacity-50"
    >
      {loading ? "..." : "Remove"}
    </button>
  );
}
