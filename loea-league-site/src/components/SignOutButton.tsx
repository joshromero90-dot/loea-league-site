"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="border-4 border-neo-ink px-3 py-1.5 text-sm font-bold text-neo-ink transition hover:border-neo-ink hover:text-neo-ink"
    >
      Sign out
    </button>
  );
}
