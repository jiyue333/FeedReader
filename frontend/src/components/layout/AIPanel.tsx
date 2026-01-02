"use client";

import { useState } from "react";

interface AIPanelProps {
  onClose: () => void;
}

/**
 * AI Chat Panel component.
 * Right sidebar for AI interactions and web search.
 * Hidden by default.
 */
export default function AIPanel({ onClose }: AIPanelProps) {
  const [message, setMessage] = useState("");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  return (
    <aside
      className="flex w-[360px] shrink-0 flex-col border-l animate-slideInRight"
      style={{
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
            AI Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
          title="Close panel"
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome Message */}
        <div
          className="rounded-lg p-4 text-sm"
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            color: "var(--color-text-secondary)",
          }}
        >
          <p className="mb-2" style={{ color: "var(--color-text-primary)" }}>
            👋 Hi! I'm your AI research assistant.
          </p>
          <p>
            Ask me about your articles, get summaries, or find related content.
            Enable web search to find external sources.
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div
        className="border-t p-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Web Search Toggle */}
        <div className="mb-3 flex items-center justify-between">
          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <div
              className="relative h-5 w-9 cursor-pointer rounded-full transition-colors"
              style={{
                backgroundColor: webSearchEnabled
                  ? "var(--color-primary)"
                  : "var(--color-bg-elevated)",
              }}
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            >
              <div
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                style={{
                  left: webSearchEnabled ? "18px" : "2px",
                }}
              />
            </div>
            Web Search
          </label>
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            {webSearchEnabled ? "Enabled" : "Local only"}
          </span>
        </div>

        {/* Input */}
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            rows={3}
            className="w-full resize-none rounded-lg pr-12 text-sm"
            style={{
              backgroundColor: "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              padding: "12px",
            }}
          />
          <button
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-elevated)]"
            title="Send message"
            style={{
              backgroundColor: message.trim()
                ? "var(--color-primary)"
                : "transparent",
              color: message.trim() ? "#000" : "var(--color-text-muted)",
            }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
