"use client";

import { useState } from "react";

interface TopBarProps {
  onToggleAI: () => void;
}

/**
 * Top navigation bar component.
 * Contains: Logo | Search | Import | More | User
 */
export default function TopBar({ onToggleAI }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b px-4"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--color-bg-tertiary)]"
          title="Refresh / Go to home"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            AnkiFlow
          </span>
        </button>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-xl px-8">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search feeds, articles, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg py-2 pl-10 pr-4 text-sm transition-all"
            style={{
              backgroundColor: "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Import Button */}
        <button
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "#000",
          }}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Import
        </button>

        {/* AI Toggle Button */}
        <button
          onClick={onToggleAI}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
          title="Toggle AI Panel"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
          >
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12a10 10 0 0 1 10-10z" />
            <path d="M9 9h.01M15 9h.01M9.5 15a5 5 0 0 0 5 0" />
          </svg>
        </button>

        {/* More Options */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
          title="More options"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>

        {/* User Avatar */}
        <button
          className="ml-2 h-8 w-8 overflow-hidden rounded-full ring-2 ring-[var(--color-border)] transition-all hover:ring-[var(--color-primary)]"
          title="User profile"
        >
          <div
            className="flex h-full w-full items-center justify-center text-sm font-medium"
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-text-primary)",
            }}
          >
            U
          </div>
        </button>
      </div>
    </header>
  );
}
