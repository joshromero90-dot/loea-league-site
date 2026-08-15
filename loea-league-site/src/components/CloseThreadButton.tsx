"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CloseThreadButton({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function close() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("trade_threads")
      .update({ is_closed: true })
      .eq("id", threadId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={close}
      disabled={loading}
      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
    >
      {loading ? "Closing..." : "Mark trade resolved / close thread"}
    </button>
  );
}
