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
import type { AppRole, RoleFormData } from "@/types/role";

type RolesContextValue = {
  roles: AppRole[];
  loading: boolean;
  refresh: () => Promise<void>;
  getRole: (id: string) => AppRole | undefined;
  getRoleByName: (name: string) => AppRole | undefined;
  createRole: (form: RoleFormData) => Promise<AppRole>;
  updateRole: (id: string, form: RoleFormData) => Promise<AppRole | null>;
  deleteRole: (id: string) => Promise<void>;
  roleNames: string[];
};

const RolesContext = createContext<RolesContextValue | null>(null);

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: AppRole[] }>("/api/roles");
      setRoles(res.items);
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !hasPermission(user?.permissions, ["users.view", "users.manage"])) {
      setRoles([]);
      return;
    }
    refresh();
  }, [isAuthenticated, user?.permissions, refresh]);

  const getRole = useCallback(
    (id: string) => roles.find((r) => r.id === id),
    [roles],
  );

  const getRoleByName = useCallback(
    (name: string) =>
      roles.find((r) => r.name.toLowerCase() === name.toLowerCase()),
    [roles],
  );

  const createRole = useCallback(async (form: RoleFormData) => {
    const res = await api<{ role: AppRole }>("/api/roles", {
      method: "POST",
      body: form,
    });
    setRoles((prev) =>
      [...prev, res.role].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return res.role;
  }, []);

  const updateRole = useCallback(async (id: string, form: RoleFormData) => {
    const res = await api<{ role: AppRole }>(`/api/roles/${id}`, {
      method: "PUT",
      body: form,
    });
    setRoles((prev) => prev.map((r) => (r.id === id ? res.role : r)));
    return res.role;
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    await api(`/api/roles/${id}`, { method: "DELETE" });
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const roleNames = useMemo(() => roles.map((r) => r.name), [roles]);

  const value = useMemo(
    () => ({
      roles,
      loading,
      refresh,
      getRole,
      getRoleByName,
      createRole,
      updateRole,
      deleteRole,
      roleNames,
    }),
    [
      roles,
      loading,
      refresh,
      getRole,
      getRoleByName,
      createRole,
      updateRole,
      deleteRole,
      roleNames,
    ],
  );

  return (
    <RolesContext.Provider value={value}>{children}</RolesContext.Provider>
  );
}

export function useRoles() {
  const ctx = useContext(RolesContext);
  if (!ctx) throw new Error("useRoles must be used within RolesProvider");
  return ctx;
}
