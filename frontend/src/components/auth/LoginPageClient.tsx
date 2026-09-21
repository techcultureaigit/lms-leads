"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginPageClient() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@techculture.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="TechCulture"
            className="login-logo"
          />
          <p>Lead Management Workspace</p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <h2>Sign in</h2>
          <p className="login-hint">Use your team account to continue.</p>

          {error ? <div className="login-error">{error}</div> : null}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="login-demo">
            Demo: <code>admin@techculture.com</code> / <code>Admin@123</code>
          </p>
        </form>
      </div>
    </div>
  );
}
