"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(params.get("next") || "/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-black uppercase tracking-tight text-neo-ink">Manager Login</h1>
      <p className="mb-6 text-sm text-neo-ink">
        The League of Extraordinary Assholes
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-neo-ink">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neo-ink">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
          />
        </div>
        {error && <p className="text-sm text-neo-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-neo-red px-4 py-2 font-bold text-neo-ink transition hover:bg-neo-yellow disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-neo-ink">
        New manager?{" "}
        <Link href="/signup" className="text-neo-ink hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
