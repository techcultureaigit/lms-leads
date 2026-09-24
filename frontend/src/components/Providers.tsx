"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LeadsProvider } from "@/context/LeadsContext";
import { UsersProvider } from "@/context/UsersContext";
import { RolesProvider } from "@/context/RolesContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { SidebarUiProvider } from "@/context/SidebarUiContext";
import AuthGate from "@/components/AuthGate";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>
        <SidebarUiProvider>
          <SettingsProvider>
            <UsersProvider>
              <RolesProvider>
                <LeadsProvider>{children}</LeadsProvider>
              </RolesProvider>
            </UsersProvider>
          </SettingsProvider>
        </SidebarUiProvider>
      </AuthGate>
    </AuthProvider>
  );
}
