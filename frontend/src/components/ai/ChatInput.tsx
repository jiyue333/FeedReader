"use client";

import { useState } from "react";

interface ChatInputProps {
    onSend: (message: string) => void;
    placeholder?: string;
}

/**
 * Chat input area with send button
 */
export default function ChatInput({
    onSend,
    placeholder = "Ask a question...",
}: ChatInputProps) {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
            setMessage("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={3}
                className="w-full resize-none rounded-lg pr-12 text-sm"
                style={{
                    backgroundColor: "var(--color-bg-tertiary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                    padding: "12px",
                }}
            />
            <button
                onClick={handleSend}
                className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                title="Send message (Enter)"
                style={{
                    backgroundColor: message.trim()
                        ? "var(--color-primary)"
                        : "transparent",
                    color: message.trim() ? "#000" : "var(--color-text-muted)",
                }}
            >
                <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
            </button>
        </div>
    );
}
