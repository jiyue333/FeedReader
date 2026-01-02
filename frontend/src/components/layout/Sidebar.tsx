"use client";

import { useState } from "react";

/**
 * Left sidebar component.
 * Upper: Feed sources list
 * Lower: Staging dock for selected articles
 */
export default function Sidebar() {
  const [selectedFeed, setSelectedFeed] = useState<string | null>("all");
  const [stagingItems, setStagingItems] = useState<{ id: string; title: string }[]>([
    // Demo items
    { id: "1", title: "Understanding RAG Architecture" },
    { id: "2", title: "Next.js 15 New Features" },
  ]);
  const [allSelected, setAllSelected] = useState(false);

  const feeds = [
    { id: "all", name: "All Feeds", icon: "📚", count: 24 },
    { id: "favorites", name: "Favorites", icon: "⭐", count: 5 },
    { id: "tech", name: "Tech News", icon: "🔧", count: 12 },
    { id: "ai", name: "AI Research", icon: "🤖", count: 8 },
  ];

  return (
    <aside
      className="flex h-full w-[280px] shrink-0 flex-col border-r"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Upper: Feed Flow */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4 py-3">
          <h2
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Feeds
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          {feeds.map((feed) => (
            <button
              key={feed.id}
              onClick={() => setSelectedFeed(feed.id)}
              className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
              style={{
                backgroundColor:
                  selectedFeed === feed.id
                    ? "var(--color-bg-tertiary)"
                    : "transparent",
                color: "var(--color-text-primary)",
              }}
            >
              <span className="flex items-center gap-2">
                <span>{feed.icon}</span>
                <span>{feed.name}</span>
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: "var(--color-bg-elevated)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {feed.count}
              </span>
            </button>
          ))}
        </nav>

        {/* Add Source Button */}
        <div className="border-t px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-2 text-sm transition-colors hover:border-solid"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
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
            Add Source
          </button>
        </div>
      </div>

      {/* Lower: Staging Dock */}
      <div
        className="flex h-2/5 flex-col border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Staging Header */}
        <div className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              Staging ({stagingItems.length})
            </h2>
            <button
              onClick={() => setAllSelected(!allSelected)}
              className="text-xs transition-colors hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Generate Takeaway Button */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all hover:opacity-90"
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
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Generate Takeaway
          </button>
        </div>

        {/* Staging Items List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {stagingItems.length === 0 ? (
            <div
              className="flex h-full items-center justify-center text-center text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              <p>
                Drag articles here or<br />
                click + to add
              </p>
            </div>
          ) : (
            stagingItems.map((item) => (
              <div
                key={item.id}
                className="mb-1 flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-[var(--color-bg-tertiary)]"
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                <span
                  className="flex-1 text-sm truncate-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.title}
                </span>
                <button
                  className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                  title="Remove from staging"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
