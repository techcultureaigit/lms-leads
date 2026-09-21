"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const SIDEBAR_KEY = "tc_sidebar_collapsed";

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

type SidebarUiContextValue = {
  collapsed: boolean;
  toggleCollapsed: () => void;
};

const SidebarUiContext = createContext<SidebarUiContextValue | null>(null);

export function SidebarUiProvider({ children }: { children: React.ReactNode }) {
  // Read localStorage on first client render so navigation doesn't flash open.
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ collapsed, toggleCollapsed }),
    [collapsed, toggleCollapsed],
  );

  return (
    <SidebarUiContext.Provider value={value}>
      {children}
    </SidebarUiContext.Provider>
  );
}

export function useSidebarUi() {
  const ctx = useContext(SidebarUiContext);
  if (!ctx) {
    return { collapsed: false, toggleCollapsed: () => {} };
  }
  return ctx;
}
