"use client";

import { useState } from "react";
import { StagingItem } from "./AppShell";

interface SidebarProps {
  stagingItems: StagingItem[];
  onAddToStaging: (item: StagingItem) => void;
  onRemoveFromStaging: (id: string) => void;
  onClearStaging: () => void;
}

/**
 * Left sidebar component.
 * Upper: Feed sources list
 * Lower: Staging dock for selected articles
 */
export default function Sidebar({
  stagingItems,
  onAddToStaging,
  onRemoveFromStaging,
  onClearStaging,
}: SidebarProps) {
  const [selectedFeed, setSelectedFeed] = useState<string | null>("all");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync "Select All" state with actual selections
  const allSelected = selectedItemIds.size > 0 && selectedItemIds.size === stagingItems.length;
  const someSelected = selectedItemIds.size > 0 && selectedItemIds.size < stagingItems.length;

  const handleSelectAll = () => {
    if (allSelected) {
      // Unselect all
      setSelectedItemIds(new Set());
    } else {
      // Select all
      setSelectedItemIds(new Set(stagingItems.map(item => item.id)));
    }
  };

  const handleToggleItem = (id: string) => {
    const newSelection = new Set(selectedItemIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItemIds(newSelection);
  };

  const feeds = [
    { id: "all", name: "All Feeds", icon: "📚", count: 24 },
    { id: "favorites", name: "Favorites", icon: "⭐", count: 5 },
    { id: "tech", name: "Tech News", icon: "🔧", count: 12 },
    { id: "ai", name: "AI Research", icon: "🤖", count: 8 },
  ];

  // Handle drop from AI panel citations
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      // Try application/json first, fallback to text/plain
      const dataStr = e.dataTransfer.getData("application/json") ||
        e.dataTransfer.getData("text/plain");

      if (!dataStr) {
        console.warn("No data in drop event");
        return;
      }

      const item = JSON.parse(dataStr) as StagingItem;

      // Validate required fields
      if (!item.id || !item.title) {
        console.warn("Invalid item data:", item);
        return;
      }

      onAddToStaging(item);
    } catch (error) {
      console.error("Failed to parse dropped data:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

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
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                {feed.count}
              </span>
            </button>
          ))}
        </nav>

        {/* Add Source Button */}
        <div className="border-t px-2 py-2" style={{ borderColor: "var(--color-border)" }}>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--color-bg-tertiary)]"
            style={{ color: "var(--color-text-secondary)" }}
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
        className="flex h-[40%] flex-col border-t"
        style={{ borderColor: "var(--color-border)" }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Header */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Staging ({stagingItems.length})
            </h2>
            <button
              onClick={handleSelectAll}
              className="text-xs transition-colors hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              {allSelected ? "Unselect All" : "Select All"}
            </button>
          </div>

          {/* Generate Takeaway Button */}
          <button
            disabled={stagingItems.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div
          className={`flex-1 overflow-y-auto px-2 pb-2 transition-colors ${isDragOver ? "bg-[var(--color-primary)]/10" : ""
            }`}
        >
          {stagingItems.length === 0 ? (
            <div
              className="flex h-full items-center justify-center text-center text-sm p-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              <p>
                Drag articles here or
                <br />
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
                  checked={selectedItemIds.has(item.id)}
                  onChange={() => handleToggleItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm line-clamp-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {item.source}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveFromStaging(item.id)}
                  className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
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
