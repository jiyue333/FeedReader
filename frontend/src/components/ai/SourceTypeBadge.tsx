"use client";

interface SourceTypeBadgeProps {
  sourceType: "local" | "web";
  className?: string;
}

/**
 * Source type badge component for displaying [LOCAL] or [WEB] tags
 */
export default function SourceTypeBadge({ sourceType, className = "" }: SourceTypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: sourceType === "local" ? "var(--color-primary)" : "var(--color-secondary)",
        color: "#000",
      }}
    >
      [{sourceType.toUpperCase()}]
    </span>
  );
}
