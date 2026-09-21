"use client";

import Sidebar from "./Sidebar";
import { useSidebarUi } from "@/context/SidebarUiContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { collapsed, setCollapsed } = useSidebarUi();

  return (
    <div
      className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}
      suppressHydrationWarning
    >
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close menu"
        tabIndex={collapsed ? -1 : 0}
        onClick={() => setCollapsed(true)}
      />
      <Sidebar />
      <div className="main">{children}</div>
    </div>
  );
}
