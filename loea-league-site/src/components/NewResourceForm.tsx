"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Rankings",
  "News",
  "Tools & Calculators",
  "Podcasts",
  "General",
];

export default function NewResourceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[4]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }
    let finalUrl = url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }
    const { error } = await supabase.from("resources").insert({
      title,
      url: finalUrl,
      description: description || null,
      category,
      added_by: user.id,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTitle("");
    setUrl("");
    setDescription("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-neo-red px-4 py-2 text-sm font-bold text-neo-ink hover:bg-neo-yellow"
      >
        + Add a link
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border-4 border-neo-ink bg-white p-5"
    >
      <input
        required
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
      />
      <input
        required
        placeholder="https://..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
      />
      <input
        placeholder="Short description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border-4 border-neo-ink bg-white px-3 py-2 text-neo-ink outline-none focus:border-neo-ink"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-neo-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-neo-red px-4 py-2 text-sm font-bold text-neo-ink hover:bg-neo-yellow disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add link"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border-4 border-neo-ink px-4 py-2 text-sm text-neo-ink hover:bg-neo-violet"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
