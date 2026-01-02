"use client";

import { useState } from "react";
import EmptyStateChips from "./EmptyStateChips";
import CitationCard, { Citation } from "./CitationCard";
import ChatInput from "./ChatInput";

interface ChatTabProps {
    onPinCitation: (citation: Citation) => void;
}

/**
 * Chat tab content with empty state, chat stream, and input
 */
export default function ChatTab({ onPinCitation }: ChatTabProps) {
    const [messages, setMessages] = useState<
        Array<{ role: "user" | "assistant"; content: string; citations?: Citation[] }>
    >([]);

    const handleSendMessage = (message: string) => {
        // Add user message
        const userMessage = { role: "user" as const, content: message };
        setMessages((prev) => [...prev, userMessage]);

        // Simulate AI response with citations (mock)
        setTimeout(() => {
            const mockCitations: Citation[] = [
                {
                    id: `citation-${Date.now()}-1`,
                    title: "Understanding RAG Architecture",
                    source: "AI Weekly",
                    snippet: "Retrieval-Augmented Generation combines the power of large language models with external knowledge retrieval...",
                },
                {
                    id: `citation-${Date.now()}-2`,
                    title: "Vector Databases for AI",
                    source: "Tech Insights",
                    snippet: "Modern AI applications rely on efficient similarity search powered by vector embeddings...",
                },
            ];

            const aiMessage = {
                role: "assistant" as const,
                content: "Based on your knowledge base, I found several relevant articles about this topic. The key insights are: RAG systems enhance LLM responses by retrieving relevant context, and vector databases enable efficient semantic search.",
                citations: mockCitations,
            };

            setMessages((prev) => [...prev, aiMessage]);
        }, 1000);
    };

    const handleChipClick = (command: string) => {
        handleSendMessage(command);
    };

    return (
        <div className="flex h-full flex-col">
            {/* Chat Messages / Empty State */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4">
                        <div className="text-center space-y-2">
                            <svg
                                className="mx-auto h-12 w-12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--color-text-muted)"
                                strokeWidth="1.5"
                            >
                                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12a10 10 0 0 1 10-10z" />
                                <path d="M9 9h.01M15 9h.01M9.5 15a5 5 0 0 0 5 0" />
                            </svg>
                            <p
                                className="text-lg font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Global Copilot
                            </p>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Ask questions about your knowledge base
                            </p>
                        </div>
                        <EmptyStateChips onChipClick={handleChipClick} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className="space-y-2">
                                <div
                                    className={`rounded-lg p-3 ${msg.role === "user"
                                        ? "ml-8"
                                        : "mr-8"
                                        }`}
                                    style={{
                                        backgroundColor:
                                            msg.role === "user"
                                                ? "var(--color-primary)"
                                                : "var(--color-bg-tertiary)",
                                        color:
                                            msg.role === "user"
                                                ? "#000"
                                                : "var(--color-text-primary)",
                                    }}
                                >
                                    {msg.content}
                                </div>
                                {msg.citations && msg.citations.length > 0 && (
                                    <div className="space-y-2 pl-4">
                                        {msg.citations.map((citation) => (
                                            <CitationCard
                                                key={citation.id}
                                                citation={citation}
                                                onPin={onPinCitation}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div
                className="border-t p-4"
                style={{ borderColor: "var(--color-border)" }}
            >
                <ChatInput onSend={handleSendMessage} />
            </div>
        </div>
    );
}
