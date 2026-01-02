"use client";

import { useState } from "react";

/**
 * Dashboard main content - Feed articles list
 */
export default function DashboardPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "pdf">(
    "all"
  );

  // Mock articles data
  const articles = [
    {
      id: "1",
      title: "Understanding Retrieval-Augmented Generation",
      source: "AI Weekly",
      date: "2h ago",
      summary:
        "A deep dive into how RAG systems work and why they're transforming AI applications...",
      isRead: false,
      isStarred: true,
      isPDF: false,
    },
    {
      id: "2",
      title: "Next.js 15: What's New and How to Upgrade",
      source: "Dev Blog",
      date: "5h ago",
      summary:
        "Explore the latest features in Next.js 15 including improved performance and new APIs...",
      isRead: true,
      isStarred: false,
      isPDF: false,
    },
    {
      id: "3",
      title: "Research Paper: Attention Is All You Need",
      source: "Papers",
      date: "1d ago",
      summary:
        "The foundational transformer architecture paper that revolutionized NLP...",
      isRead: false,
      isStarred: true,
      isPDF: true,
    },
    {
      id: "4",
      title: "Building Production-Ready LLM Applications",
      source: "Tech Insights",
      date: "2d ago",
      summary:
        "Best practices for deploying and scaling large language model applications...",
      isRead: true,
      isStarred: false,
      isPDF: false,
    },
  ];

  const filteredArticles = articles.filter((article) => {
    switch (filter) {
      case "unread":
        return !article.isRead;
      case "starred":
        return article.isStarred;
      case "pdf":
        return article.isPDF;
      default:
        return true;
    }
  });

  return (
    <div className="flex h-full flex-col">
      {/* Filter Bar */}
      <div
        className="flex items-center gap-4 border-b px-6 py-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Filter Chips */}
        <div className="flex gap-2">
          {(
            [
              { key: "all", label: "All", count: articles.length },
              {
                key: "unread",
                label: "Unread",
                count: articles.filter((a) => !a.isRead).length,
              },
              {
                key: "starred",
                label: "Starred",
                count: articles.filter((a) => a.isStarred).length,
              },
              {
                key: "pdf",
                label: "PDF Only",
                count: articles.filter((a) => a.isPDF).length,
              },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
              style={{
                backgroundColor:
                  filter === f.key
                    ? "var(--color-primary)"
                    : "var(--color-bg-tertiary)",
                color: filter === f.key ? "#000" : "var(--color-text-secondary)",
              }}
            >
              {f.label}
              <span
                className="text-xs opacity-80"
                style={{
                  color: filter === f.key ? "#000" : "inherit",
                }}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Extension Slot */}
        <button
          className="flex items-center gap-1 rounded-lg border border-dashed px-3 py-1.5 text-sm transition-colors hover:border-solid"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
          }}
          title="More filters"
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
          <span>Add Filter</span>
        </button>
      </div>

      {/* Articles List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredArticles.length === 0 ? (
          <div
            className="flex h-full items-center justify-center text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            <div>
              <svg
                className="mx-auto mb-4 h-16 w-16 opacity-50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
              <p className="text-lg font-medium">No articles found</p>
              <p className="mt-1 text-sm">
                Try changing your filters or add new sources
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="group cursor-pointer rounded-xl p-4 transition-all hover:translate-x-1"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Meta Row */}
                    <div
                      className="mb-1 flex items-center gap-2 text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                      {article.isPDF && (
                        <>
                          <span>•</span>
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
                            style={{
                              backgroundColor: "var(--color-bg-elevated)",
                              color: "var(--color-primary)",
                            }}
                          >
                            PDF
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className="mb-2 text-base font-semibold leading-snug group-hover:text-[var(--color-primary)]"
                      style={{
                        color: article.isRead
                          ? "var(--color-text-secondary)"
                          : "var(--color-text-primary)",
                      }}
                    >
                      {article.title}
                    </h3>

                    {/* Summary */}
                    <p
                      className="text-sm truncate-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {article.summary}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    {/* Star */}
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
                      title={article.isStarred ? "Unstar" : "Star"}
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill={article.isStarred ? "var(--color-warning)" : "none"}
                        stroke={
                          article.isStarred
                            ? "var(--color-warning)"
                            : "var(--color-text-muted)"
                        }
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>

                    {/* Add to Staging */}
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-primary)]"
                      title="Add to staging"
                      style={{ color: "var(--color-text-muted)" }}
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
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
