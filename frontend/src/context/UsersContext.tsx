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
import { ROLE_PERMISSIONS, initialsFromName } from "@/lib/roles";
import type { AppUser, UserFormData, Permission } from "@/types/user";

type UsersContextValue = {
  users: AppUser[];
  loading: boolean;
  getUser: (id: string) => AppUser | undefined;
  createUser: (form: UserFormData & { password?: string }) => Promise<AppUser>;
  updateUser: (id: string, form: UserFormData & { password?: string }) => Promise<AppUser | null>;
  deleteUser: (id: string) => Promise<void>;
  userNames: string[];
};

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: AppUser[] }>("/api/users");
      setUsers(res.items);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const canLoadUsers = hasPermission(user?.permissions, [
      "users.view",
      "leads.create",
      "leads.edit",
    ]);
    if (!isAuthenticated || !canLoadUsers) {
      setUsers([]);
      return;
    }
    refresh();
  }, [isAuthenticated, user?.permissions, refresh]);

  const getUser = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users],
  );

  const createUser = useCallback(
    async (form: UserFormData & { password?: string }) => {
      const defaultPerms =
        (ROLE_PERMISSIONS as Record<string, Permission[]>)[form.role] || [];
      const res = await api<{ user: AppUser }>("/api/users", {
        method: "POST",
        body: {
          ...form,
          password: form.password.trim() || "User@123",
          initials: initialsFromName(form.name),
          permissions: form.permissions.length
            ? form.permissions
            : defaultPerms,
        },
      });
      setUsers((prev) => [...prev, res.user].sort((a, b) => a.name.localeCompare(b.name)));
      return res.user;
    },
    [],
  );

  const updateUser = useCallback(
    async (id: string, form: UserFormData & { password?: string }) => {
      const password = form.password.trim();
      const res = await api<{ user: AppUser }>(`/api/users/${id}`, {
        method: "PUT",
        body: {
          ...form,
          password: password || undefined,
        },
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? res.user : u)));
      return res.user;
    },
    [],
  );

  const deleteUser = useCallback(async (id: string) => {
    await api(`/api/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const userNames = useMemo(() => users.map((u) => u.name), [users]);

  const value = useMemo(
    () => ({
      users,
      loading,
      getUser,
      createUser,
      updateUser,
      deleteUser,
      userNames,
    }),
    [users, loading, getUser, createUser, updateUser, deleteUser, userNames],
  );

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
}
