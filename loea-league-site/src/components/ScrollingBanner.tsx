"use client";

import { useState } from "react";

const MESSAGES = [
  '"It\'s all about offensive coordinators, bub." - Kohl Wingfield',
  "Current Champion: Ryan Long",
  "Consolation Bracket Winner: Mason Torrez - Reaper Rule",
];

export default function ScrollingBanner() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      className="league-ticker border-b-4 border-neo-ink bg-neo-highlight text-neo-ink"
      aria-label="League announcements"
      data-paused={paused}
    >
      <p className="sr-only">{MESSAGES.join(". ")}</p>
      <div className="league-ticker-window" aria-hidden="true">
        <div className="league-ticker-track">
          {[0, 1].map((copy) => (
            <div className="league-ticker-group" key={copy}>
              {MESSAGES.map((message) => (
                <span key={message}>
                  {message}
                  <span className="league-ticker-separator">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="league-ticker-toggle"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "Resume scrolling announcements" : "Pause scrolling announcements"}
        aria-pressed={paused}
      >
        {paused ? "Resume" : "Pause"}
      </button>
    </section>
  );
}
