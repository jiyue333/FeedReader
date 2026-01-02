"use client";

import { useState, ReactNode, useEffect } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import AIPanel from "./AIPanel";

interface AppShellProps {
  children: ReactNode;
}

export interface StagingItem {
  id: string;
  title: string;
  source: string;
}

/**
 * Main application shell component.
 * Provides the three-column layout: Sidebar | Content | AI Panel
 * Manages global state: AI panel visibility, staging items
 */
export default function AppShell({ children }: AppShellProps) {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [stagingItems, setStagingItems] = useState<StagingItem[]>([
    // Demo items
    { id: "1", title: "Understanding RAG Architecture", source: "AI Weekly" },
    { id: "2", title: "Next.js 15 New Features", source: "Dev Blog" },
  ]);

  // Add item to staging (from AI citations or article list)
  const addToStaging = (item: StagingItem) => {
    setStagingItems((prev) => {
      // Prevent duplicates
      if (prev.find((i) => i.id === item.id)) {
        return prev;
      }
      return [item, ...prev]; // Add to top
    });
  };

  // Remove item from staging
  const removeFromStaging = (id: string) => {
    setStagingItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all staging items
  const clearStaging = () => {
    setStagingItems([]);
  };

  // Global keyboard shortcut: Cmd+B to toggle AI panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd+B (Mac) or Ctrl+B (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsAIPanelOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-primary)]">
      {/* Top Bar */}
      <TopBar onToggleAI={() => setIsAIPanelOpen(!isAIPanelOpen)} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          stagingItems={stagingItems}
          onAddToStaging={addToStaging}
          onRemoveFromStaging={removeFromStaging}
          onClearStaging={clearStaging}
        />

        {/* Center Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-primary)]">
          {children}
        </main>

        {/* Right AI Panel (conditionally rendered) */}
        {isAIPanelOpen && (
          <AIPanel
            onClose={() => setIsAIPanelOpen(false)}
            onPinToStaging={addToStaging}
          />
        )}
      </div>
    </div>
  );
}
