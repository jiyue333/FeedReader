"use client";

import { useState } from "react";
import {
  AIPanelTabs,
  ScopeSelector,
  ChatTab,
  InsightsTab,
  Citation,
} from "@/components/ai";

interface AIPanelProps {
  onClose: () => void;
  onPinToStaging: (item: { id: string; title: string; source: string }) => void;
}

type TabType = "chat" | "insights" | "more";
type ScopeType = "global" | "current" | "web";

/**
 * Intelligence - Global Copilot Panel
 * Right sidebar for AI interactions with global knowledge base
 */
export default function AIPanel({ onClose, onPinToStaging }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [scope, setScope] = useState<ScopeType>("global");

  const handlePinCitation = (citation: Citation) => {
    onPinToStaging({
      id: citation.id,
      title: citation.title,
      source: citation.source,
    });
  };

  return (
    <aside
      className="flex shrink-0 flex-col border-l animate-slideInRight"
      style={{
        width: "var(--ai-panel-width)",
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Header */}
      <div
        className="flex h-14 items-center justify-between border-b px-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
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
          <span
            className="font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Intelligence
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
          title="Close panel (Cmd+B)"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <AIPanelTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Scope Selector */}
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
        <ScopeSelector scope={scope} onScopeChange={setScope} />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && <ChatTab onPinCitation={handlePinCitation} />}
        {activeTab === "insights" && <InsightsTab />}
        {activeTab === "more" && (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p style={{ color: "var(--color-text-secondary)" }}>
              More features coming soon...
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
