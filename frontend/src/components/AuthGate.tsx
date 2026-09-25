"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { canAccessPath, firstAllowedPath } from "@/lib/permissions";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";
  const home = firstAllowedPath(user?.permissions);
  const allowed = isLogin || canAccessPath(pathname, user?.permissions);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !isLogin) {
      router.replace("/login");
    } else if (isAuthenticated && isLogin) {
      router.replace(home);
    } else if (isAuthenticated && !allowed) {
      router.replace(home);
    }
  }, [loading, isAuthenticated, isLogin, allowed, home, router]);

  if (loading) {
    return (
      <div className="auth-boot">
        <div className="auth-boot-card">
          <strong>TechCulture</strong>
          <p>Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLogin) return null;
  if (isAuthenticated && isLogin) return null;
  if (isAuthenticated && !allowed) return null;

  return <>{children}</>;
}
