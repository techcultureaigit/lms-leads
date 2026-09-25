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
import { api } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import type { LeadActivity } from "@/types/activity";
import type { Lead, LeadFormData, LeadStatus } from "@/types/lead";

type LeadsContextValue = {
  leads: Lead[];
  loading: boolean;
  refreshLeads: () => Promise<void>;
  getLead: (id: string) => Lead | undefined;
  fetchLead: (id: string) => Promise<Lead | null>;
  getActivities: (leadId: string) => LeadActivity[];
  loadActivities: (leadId: string) => Promise<LeadActivity[]>;
  addNote: (leadId: string, message: string) => Promise<void>;
  createLead: (form: LeadFormData) => Promise<Lead>;
  updateLead: (id: string, form: LeadFormData) => Promise<Lead | null>;
  patchLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: LeadStatus) => Promise<void>;
  bulkAssign: (ids: string[], owner: string) => Promise<void>;
  bulkSetFollowup: (ids: string[], followup: string) => Promise<void>;
};

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activitiesByLead, setActivitiesByLead] = useState<
    Record<string, LeadActivity[]>
  >({});
  const [loading, setLoading] = useState(false);

  const refreshLeads = useCallback(async () => {
    setLoading(true);
    try {
      const all: Lead[] = [];
      let page = 1;
      let pages = 1;

      do {
        const res = await api<{
          items: Lead[];
          total: number;
          page: number;
          pages: number;
        }>(`/api/leads?limit=100&page=${page}&sort=-createdAt`);
        all.push(...(res.items || []));
        pages = Math.max(1, Number(res.pages) || 1);
        page += 1;
      } while (page <= pages);

      setLeads(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !hasPermission(user?.permissions, "leads.view")) {
      setLeads([]);
      setActivitiesByLead({});
      return;
    }
    refreshLeads().catch(() => setLeads([]));
  }, [isAuthenticated, user?.permissions, refreshLeads]);

  const getLead = useCallback(
    (id: string) => leads.find((l) => l.id === id),
    [leads],
  );

  const fetchLead = useCallback(async (id: string) => {
    try {
      const res = await api<{ lead: Lead }>(`/api/leads/${id}`);
      setLeads((prev) => {
        const exists = prev.some((l) => l.id === res.lead.id);
        if (exists) {
          return prev.map((l) => (l.id === res.lead.id ? res.lead : l));
        }
        return [res.lead, ...prev];
      });
      return res.lead;
    } catch {
      return null;
    }
  }, []);

  const getActivities = useCallback(
    (leadId: string) => activitiesByLead[leadId] || [],
    [activitiesByLead],
  );

  const loadActivities = useCallback(async (leadId: string) => {
    const res = await api<{ items: LeadActivity[] }>(
      `/api/activities/lead/${leadId}`,
    );
    setActivitiesByLead((prev) => ({ ...prev, [leadId]: res.items }));
    return res.items;
  }, []);

  const addNote = useCallback(async (leadId: string, message: string) => {
    const text = message.trim();
    if (!text) return;
    const res = await api<{ activity: LeadActivity }>(
      `/api/activities/lead/${leadId}/notes`,
      { method: "POST", body: { message: text } },
    );
    setActivitiesByLead((prev) => ({
      ...prev,
      [leadId]: [res.activity, ...(prev[leadId] || [])],
    }));
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: text } : l)),
    );
  }, []);

  const createLead = useCallback(async (form: LeadFormData) => {
    const res = await api<{ lead: Lead; meetWarning?: string }>("/api/leads", {
      method: "POST",
      body: form,
    });
    setLeads((prev) => [res.lead, ...prev]);
    if (res.meetWarning) {
      alert(res.meetWarning);
    } else if (res.lead.meetingLink) {
      alert(`Google Meet link created:\n${res.lead.meetingLink}`);
    }
    return res.lead;
  }, []);

  const updateLead = useCallback(async (id: string, form: LeadFormData) => {
    const res = await api<{ lead: Lead; meetWarning?: string }>(`/api/leads/${id}`, {
      method: "PUT",
      body: form,
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? res.lead : l)));
    await loadActivities(id).catch(() => undefined);
    if (res.meetWarning) {
      alert(res.meetWarning);
    } else if (
      form.status === "Meeting" &&
      form.meetingType === "Online" &&
      res.lead.meetingLink &&
      res.lead.meetingLink !== form.meetingLink
    ) {
      alert(`Google Meet link ready:\n${res.lead.meetingLink}`);
    }
    return res.lead;
  }, [loadActivities]);

  const patchLead = useCallback(async (id: string, patch: Partial<Lead>) => {
    const current = leads.find((l) => l.id === id);
    if (!current) return;
    const body = {
      entity: current.entity,
      contact: current.contact,
      mobile: current.mobile,
      email: current.email,
      location: current.location,
      website: current.website || "",
      products: current.products,
      status: current.status,
      leadSource: current.leadSource || "",
      owner: current.owner,
      assigned: current.assigned,
      followup: current.followup,
      notes: current.notes || "",
      meetingDate: current.meetingDate || "",
      meetingType: current.meetingType || "",
      meetingLink: current.meetingLink || "",
      lostDate: current.lostDate || "",
      wonDate: current.wonDate || "",
      ...patch,
    };
    const res = await api<{ lead: Lead }>(`/api/leads/${id}`, {
      method: "PUT",
      body,
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? res.lead : l)));
  }, [leads]);

  const deleteLead = useCallback(async (id: string) => {
    await api(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setActivitiesByLead((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const bulkDelete = useCallback(async (ids: string[]) => {
    await api("/api/leads/bulk/delete", {
      method: "POST",
      body: { ids },
    });
    const set = new Set(ids);
    setLeads((prev) => prev.filter((l) => !set.has(l.id)));
  }, []);

  const bulkUpdateStatus = useCallback(
    async (ids: string[], status: LeadStatus) => {
      const res = await api<{ items: Lead[] }>("/api/leads/bulk/update", {
        method: "POST",
        body: { ids, status },
      });
      const map = new Map(res.items.map((l) => [l.id, l]));
      setLeads((prev) => prev.map((l) => map.get(l.id) || l));
    },
    [],
  );

  const bulkAssign = useCallback(async (ids: string[], owner: string) => {
    const res = await api<{ items: Lead[] }>("/api/leads/bulk/update", {
      method: "POST",
      body: { ids, owner },
    });
    const map = new Map(res.items.map((l) => [l.id, l]));
    setLeads((prev) => prev.map((l) => map.get(l.id) || l));
  }, []);

  const bulkSetFollowup = useCallback(
    async (ids: string[], followup: string) => {
      const res = await api<{ items: Lead[] }>("/api/leads/bulk/update", {
        method: "POST",
        body: { ids, followup },
      });
      const map = new Map(res.items.map((l) => [l.id, l]));
      setLeads((prev) => prev.map((l) => map.get(l.id) || l));
    },
    [],
  );

  const value = useMemo(
    () => ({
      leads,
      loading,
      refreshLeads,
      getLead,
      fetchLead,
      getActivities,
      loadActivities,
      addNote,
      createLead,
      updateLead,
      patchLead,
      deleteLead,
      bulkDelete,
      bulkUpdateStatus,
      bulkAssign,
      bulkSetFollowup,
    }),
    [
      leads,
      loading,
      refreshLeads,
      getLead,
      fetchLead,
      getActivities,
      loadActivities,
      addNote,
      createLead,
      updateLead,
      patchLead,
      deleteLead,
      bulkDelete,
      bulkUpdateStatus,
      bulkAssign,
      bulkSetFollowup,
    ],
  );

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used within LeadsProvider");
  return ctx;
}
