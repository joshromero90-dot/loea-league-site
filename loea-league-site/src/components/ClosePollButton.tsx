"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ClosePollButton({ pollId }: { pollId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function closePoll() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("polls").update({ is_closed: true }).eq("id", pollId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={closePoll}
      disabled={loading}
      className="border-4 border-neo-ink px-4 py-2 text-sm text-neo-ink transition hover:border-red-500 hover:text-neo-error disabled:opacity-50"
    >
      {loading ? "Closing..." : "Close poll"}
    </button>
  );
}
