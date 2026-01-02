"use client";

interface AIPanelTabsProps {
    activeTab: "chat" | "insights" | "more";
    onTabChange: (tab: "chat" | "insights" | "more") => void;
}

/**
 * Tabs for AI Panel: Chat | Insights | More
 */
export default function AIPanelTabs({
    activeTab,
    onTabChange,
}: AIPanelTabsProps) {
    const tabs = [
        { id: "chat" as const, label: "Chat" },
        { id: "insights" as const, label: "Insights" },
        { id: "more" as const, label: "..." },
    ];

    return (
        <div
            className="flex items-center gap-1 border-b px-4"
            style={{ borderColor: "var(--color-border)" }}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className="relative px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                        color:
                            activeTab === tab.id
                                ? "var(--color-primary)"
                                : "var(--color-text-secondary)",
                    }}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div
                            className="absolute bottom-0 left-0 right-0 h-0.5"
                            style={{ backgroundColor: "var(--color-primary)" }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
