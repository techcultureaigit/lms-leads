"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !isLogin) {
      router.replace("/login");
    } else if (isAuthenticated && isLogin) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, isLogin, router]);

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

  return <>{children}</>;
}
