"use client";

import { useState, useEffect, useRef } from "react";
import EmptyStateChips from "./EmptyStateChips";
import CitationCard, { Citation } from "./CitationCard";
import ChatInput from "./ChatInput";

interface ChatTabProps {
    onPinCitation: (citation: Citation) => void;
    scope: "global" | "current_view" | "web";
    includeWeb: boolean;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
}

/**
 * Chat tab content with empty state, chat stream, and input
 */
export default function ChatTab({ onPinCitation, scope, includeWeb }: ChatTabProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleSendMessage = async (message: string) => {
        // Cancel previous request if any
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        // Add user message
        const userMessage: Message = { role: "user", content: message };
        setMessages((prev) => [...prev, userMessage]);

        // Start streaming AI response
        setIsStreaming(true);

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
            const response = await fetch(`${API_BASE}/api/chat/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    scope,
                    include_web: includeWeb,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("No response body");
            }

            let assistantMessage: Message = { role: "assistant", content: "", citations: [] };
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        try {
                            const event = JSON.parse(data);

                            if (event.type === "text") {
                                assistantMessage.content += event.content;
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    if (newMessages[newMessages.length - 1]?.role === "assistant") {
                                        newMessages[newMessages.length - 1] = { ...assistantMessage };
                                    } else {
                                        newMessages.push({ ...assistantMessage });
                                    }
                                    return newMessages;
                                });
                            } else if (event.type === "citation") {
                                assistantMessage.citations = assistantMessage.citations || [];
                                assistantMessage.citations.push(event.citation);
                            } else if (event.type === "error") {
                                console.error("Stream error:", event.error);
                            }
                        } catch (e) {
                            console.error("Failed to parse SSE event:", e);
                        }
                    }
                }
            }

            // Final update with citations
            setMessages((prev) => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.role === "assistant") {
                    newMessages[newMessages.length - 1] = { ...assistantMessage };
                }
                return newMessages;
            });
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsStreaming(false);
        }
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
