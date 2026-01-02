"use client";

interface EmptyStateChipsProps {
    onChipClick: (command: string) => void;
}

/**
 * Quick action chips for empty state
 */
export default function EmptyStateChips({ onChipClick }: EmptyStateChipsProps) {
    const chips = [
        "Summarize these unread articles",
        "What are the trending topics?",
        "Find articles about AI safety",
        "Show me recent PDFs",
    ];

    return (
        <div className="space-y-3">
            <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                Quick actions:
            </p>
            <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                    <button
                        key={chip}
                        onClick={() => onChipClick(chip)}
                        className="rounded-full px-4 py-2 text-sm transition-colors hover:bg-[var(--color-primary)] hover:text-black"
                        style={{
                            backgroundColor: "var(--color-bg-tertiary)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        {chip}
                    </button>
                ))}
            </div>
        </div>
    );
}
