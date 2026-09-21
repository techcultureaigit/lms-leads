"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SIDEBAR_KEY = "tc_sidebar_collapsed";
const MOBILE_SIDEBAR_MQ = "(max-width: 900px)";

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia(MOBILE_SIDEBAR_MQ).matches;
  } catch {
    return false;
  }
}

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  // Mobile uses an off-canvas drawer — start closed so content isn't covered.
  if (isMobileViewport()) return true;
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

type SidebarUiContextValue = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
};

const SidebarUiContext = createContext<SidebarUiContextValue | null>(null);

export function SidebarUiProvider({ children }: { children: React.ReactNode }) {
  // Read localStorage on first client render so navigation doesn't flash open.
  const [collapsed, setCollapsedState] = useState(readCollapsed);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    // Only persist desktop preference; mobile drawer is ephemeral.
    if (isMobileViewport()) return;
    try {
      localStorage.setItem(SIDEBAR_KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      if (!isMobileViewport()) {
        try {
          localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }, []);

  // Close drawer when crossing into mobile widths so content isn't covered.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_SIDEBAR_MQ);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setCollapsedState(true);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({ collapsed, toggleCollapsed, setCollapsed }),
    [collapsed, toggleCollapsed, setCollapsed],
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
    return {
      collapsed: false,
      toggleCollapsed: () => {},
      setCollapsed: () => {},
    };
  }
  return ctx;
}
