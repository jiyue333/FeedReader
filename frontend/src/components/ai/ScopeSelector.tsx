"use client";

type ScopeType = "global" | "current" | "web";

interface ScopeSelectorProps {
    scope: ScopeType;
    onScopeChange: (scope: ScopeType) => void;
}

/**
 * Scope selector for AI queries:
 * - Global Library: Search across all documents
 * - Current View: Search within filtered articles
 * - Web Search: Include web results
 */
export default function ScopeSelector({
    scope,
    onScopeChange,
}: ScopeSelectorProps) {
    const scopes = [
        { id: "global" as const, label: "Global Library", icon: "📚" },
        { id: "current" as const, label: "Current View", icon: "📄" },
        { id: "web" as const, label: "Web Search", icon: "🌐" },
    ];

    return (
        <div className="relative">
            <select
                value={scope}
                onChange={(e) => onScopeChange(e.target.value as ScopeType)}
                className="w-full cursor-pointer appearance-none rounded-lg px-3 py-2 pr-8 text-sm font-medium transition-colors"
                style={{
                    backgroundColor: "var(--color-bg-tertiary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                }}
            >
                {scopes.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.icon} {s.label}
                    </option>
                ))}
            </select>
            <svg
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-secondary)"
                strokeWidth="2"
            >
                <path d="M6 9l6 6 6-6" />
            </svg>
        </div>
    );
}
