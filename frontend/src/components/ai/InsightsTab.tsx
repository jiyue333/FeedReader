"use client";

/**
 * Insights tab - Placeholder for trends and summaries
 */
export default function InsightsTab() {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <svg
                className="mb-4 h-16 w-16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth="1.5"
            >
                <path d="M3 3v18h18" />
                <path d="M7 16l4-8 4 4 4-12" />
            </svg>
            <h3
                className="mb-2 text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Insights & Trends
            </h3>
            <p
                className="mb-4 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                Visualize reading patterns, trending topics, and knowledge graph
            </p>
            <div
                className="rounded-lg px-4 py-2 text-xs"
                style={{
                    backgroundColor: "var(--color-bg-tertiary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                }}
            >
                Coming Soon
            </div>
        </div>
    );
}
