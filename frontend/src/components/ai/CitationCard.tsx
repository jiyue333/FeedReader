"use client";

export interface Citation {
    id: string;
    title: string;
    source: string;
    snippet?: string;
}

interface CitationCardProps {
    citation: Citation;
    onPin: (citation: Citation) => void;
}

/**
 * Citation card in AI responses.
 * Supports drag & drop to staging area.
 */
export default function CitationCard({ citation, onPin }: CitationCardProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = "copy";
        const data = JSON.stringify({
            id: citation.id,
            title: citation.title,
            source: citation.source,
        });
        // Set both types for cross-browser compatibility
        e.dataTransfer.setData("application/json", data);
        e.dataTransfer.setData("text/plain", data);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="group cursor-move rounded-lg p-3 transition-colors"
            style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border)",
            }}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <svg
                            className="h-4 w-4 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--color-primary)"
                            strokeWidth="2"
                        >
                            <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                        </svg>
                        <p
                            className="text-sm font-medium line-clamp-1"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {citation.title}
                        </p>
                    </div>
                    <p
                        className="text-xs line-clamp-1"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        {citation.source}
                    </p>
                    {citation.snippet && (
                        <p
                            className="text-xs line-clamp-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {citation.snippet}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => onPin(citation)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--color-primary)]"
                    title="Pin to staging"
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
                </button>
            </div>
        </div>
    );
}
