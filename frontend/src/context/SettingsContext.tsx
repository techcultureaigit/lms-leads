"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { LEAD_SOURCES as DEFAULT_LEAD_SOURCES } from "@/lib/constants";

type SettingsContextValue = {
  leadSources: string[];
  loading: boolean;
  refreshSettings: () => Promise<void>;
  addLeadSource: (name: string) => Promise<void>;
  removeLeadSource: (name: string) => Promise<void>;
  saveLeadSources: (sources: string[]) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [leadSources, setLeadSources] = useState<string[]>([
    ...DEFAULT_LEAD_SOURCES,
  ]);
  const [loading, setLoading] = useState(false);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ leadSources: string[] }>("/api/settings");
      setLeadSources(
        res.leadSources?.length ? res.leadSources : [...DEFAULT_LEAD_SOURCES],
      );
    } catch {
      setLeadSources([...DEFAULT_LEAD_SOURCES]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLeadSources([...DEFAULT_LEAD_SOURCES]);
      return;
    }
    refreshSettings().catch(() => undefined);
  }, [isAuthenticated, refreshSettings]);

  const addLeadSource = useCallback(async (name: string) => {
    const res = await api<{ leadSources: string[] }>("/api/settings/lead-sources", {
      method: "POST",
      body: { name },
    });
    setLeadSources(res.leadSources);
  }, []);

  const removeLeadSource = useCallback(async (name: string) => {
    const res = await api<{ leadSources: string[] }>(
      `/api/settings/lead-sources/${encodeURIComponent(name)}`,
      { method: "DELETE" },
    );
    setLeadSources(res.leadSources);
  }, []);

  const saveLeadSources = useCallback(async (sources: string[]) => {
    const res = await api<{ leadSources: string[] }>("/api/settings/lead-sources", {
      method: "PUT",
      body: { leadSources: sources },
    });
    setLeadSources(res.leadSources);
  }, []);

  const value = useMemo(
    () => ({
      leadSources,
      loading,
      refreshSettings,
      addLeadSource,
      removeLeadSource,
      saveLeadSources,
    }),
    [
      leadSources,
      loading,
      refreshSettings,
      addLeadSource,
      removeLeadSource,
      saveLeadSources,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      leadSources: [...DEFAULT_LEAD_SOURCES],
      loading: false,
      refreshSettings: async () => {},
      addLeadSource: async () => {
        throw new ApiError("Settings unavailable", 500);
      },
      removeLeadSource: async () => {
        throw new ApiError("Settings unavailable", 500);
      },
      saveLeadSources: async () => {
        throw new ApiError("Settings unavailable", 500);
      },
    };
  }
  return ctx;
}
