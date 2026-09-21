import type { Permission } from "@/types/user";

export interface AppRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type RoleFormData = {
  name: string;
  description: string;
  permissions: Permission[];
};
