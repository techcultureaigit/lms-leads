"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LeadsProvider } from "@/context/LeadsContext";
import { UsersProvider } from "@/context/UsersContext";
import { RolesProvider } from "@/context/RolesContext";
import { SidebarUiProvider } from "@/context/SidebarUiContext";
import AuthGate from "@/components/AuthGate";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>
        <SidebarUiProvider>
          <UsersProvider>
            <RolesProvider>
              <LeadsProvider>{children}</LeadsProvider>
            </RolesProvider>
          </UsersProvider>
        </SidebarUiProvider>
      </AuthGate>
    </AuthProvider>
  );
}
