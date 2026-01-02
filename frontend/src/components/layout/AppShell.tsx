"use client";

import { useState, ReactNode } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import AIPanel from "./AIPanel";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Main application shell component.
 * Provides the three-column layout: Sidebar | Content | AI Panel
 */
export default function AppShell({ children }: AppShellProps) {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-primary)]">
      {/* Top Bar */}
      <TopBar onToggleAI={() => setIsAIPanelOpen(!isAIPanelOpen)} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-primary)]">
          {children}
        </main>

        {/* Right AI Panel (conditionally rendered) */}
        {isAIPanelOpen && (
          <AIPanel onClose={() => setIsAIPanelOpen(false)} />
        )}
      </div>
    </div>
  );
}
