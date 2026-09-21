"use client";

import Sidebar from "./Sidebar";
import { SidebarUiProvider, useSidebarUi } from "@/context/SidebarUiContext";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarUi();

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar />
      <div className="main">{children}</div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarUiProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarUiProvider>
  );
}
