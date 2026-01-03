"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Document {
  id: string;
  title: string;
  author?: string;
  published_at?: string;
  url?: string;
  content?: string;
  summary?: string;
  is_read: boolean;
  is_starred: boolean;
}

/**
 * Document detail page showing article content and metadata
 */
export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInStaging, setIsInStaging] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/documents/${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDocument(data.data);

        // Check if document is in staging
        const stagingResponse = await fetch("http://localhost:8000/api/staging");
        if (stagingResponse.ok) {
          const stagingData = await stagingResponse.json();
          const inStaging = stagingData.data.items.some(
            (item: any) => item.document_id === params.id
          );
          setIsInStaging(inStaging);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDocument();
    }
  }, [params.id]);

  const handleAddToStaging = async () => {
    if (!document) return;

    try {
      const response = await fetch("http://localhost:8000/api/staging", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: document.id,
        }),
      });

      if (response.ok) {
        setIsInStaging(true);
      }
    } catch (err) {
      console.error("Failed to add to staging:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p style={{ color: "var(--color-text-primary)" }} className="text-lg font-semibold">
            Document not found
          </p>
          <p style={{ color: "var(--color-text-secondary)" }} className="mt-2">
            {error || "The requested document could not be loaded."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg px-4 py-2"
            style={{ backgroundColor: "var(--color-primary)", color: "#000" }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-10 flex h-14 items-center justify-between border-b px-6"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
        }}
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Library / {document.title}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToStaging}
            disabled={isInStaging}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
            style={{
              backgroundColor: isInStaging ? "var(--color-bg-tertiary)" : "var(--color-primary)",
              color: isInStaging ? "var(--color-text-muted)" : "#000",
            }}
            title={isInStaging ? "Already in staging" : "Add to staging"}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {isInStaging ? "In Staging" : "Add to Staging"}
          </button>

          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
            title="More options"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Article Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Title */}
        <h1
          className="text-4xl font-bold leading-tight"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-reading)" }}
        >
          {document.title}
        </h1>

        {/* Metadata */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {document.author && <span>By {document.author}</span>}
          {document.published_at && (
            <span>{new Date(document.published_at).toLocaleDateString()}</span>
          )}
          {document.url && (
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              <span>View original</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          )}
        </div>

        {/* Summary */}
        {document.summary && (
          <div
            className="mt-8 rounded-lg p-4"
            style={{ backgroundColor: "var(--color-bg-secondary)", borderLeft: "4px solid var(--color-primary)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Summary
            </p>
            <p className="mt-2" style={{ color: "var(--color-text-secondary)" }}>
              {document.summary}
            </p>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert mt-12 max-w-none whitespace-pre-wrap"
          style={{
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-reading)",
            fontSize: "1.125rem",
            lineHeight: "1.75",
          }}
        >
          {document.content || "No content available."}
        </div>
      </div>
    </div>
  );
}
