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
      className="border-2 border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:border-amber-500 hover:text-amber-500"
    >
      Sign out
    </button>
  );
}
