"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, team_name: teamName },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      // Email confirmation is off in Supabase — the user is already signed
      // in, so skip the "check your email" screen entirely.
      router.push("/");
      router.refresh();
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 text-center">
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tight text-neo-ink">Check your email</h1>
        <p className="text-neo-ink">
          We sent a confirmation link to <strong>{email}</strong>. Click it,
          then come back and log in.
        </p>
        <Link href="/login" className="mt-6 text-neo-ink hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-black uppercase tracking-tight text-neo-ink">Join the League</h1>
      <p className="mb-6 text-sm text-neo-ink">Create your manager account</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-neo-ink">Your name</label>
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border-4 border-neo-ink bg-neo-paper px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neo-ink">
            Team name (optional)
          </label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full border-4 border-neo-ink bg-neo-paper px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neo-ink">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-4 border-neo-ink bg-neo-paper px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neo-ink">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-4 border-neo-ink bg-neo-paper px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
          />
        </div>
        {error && <p className="text-sm text-neo-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-neo-accent px-4 py-2 font-bold text-neo-ink transition hover:bg-neo-highlight disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-neo-ink">
        Already have an account?{" "}
        <Link href="/login" className="text-neo-ink hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
