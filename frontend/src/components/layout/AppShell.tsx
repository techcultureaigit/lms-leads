"use client";

import Sidebar from "./Sidebar";
import { useSidebarUi } from "@/context/SidebarUiContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarUi();

  return (
    <div
      className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}
      suppressHydrationWarning
    >
      <Sidebar />
      <div className="main">{children}</div>
    </div>
  );
}
