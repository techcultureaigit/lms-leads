"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { ApiError } from "@/lib/api";

const SECTIONS = [
  {
    id: "Profile",
    hint: "Your public sales profile",
    icon: "profile",
  },
  {
    id: "Notifications",
    hint: "Choose how you get reminded",
    icon: "bell",
  },
  {
    id: "Workspace",
    hint: "Company-level defaults",
    icon: "workspace",
  },
  {
    id: "Security",
    hint: "Password and session controls",
    icon: "security",
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function SectionIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "profile") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 19a7 7 0 0 1 14 0" />
      </svg>
    );
  }
  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    );
  }
  if (name === "workspace") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" {...common}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function SettingsPageClient() {
  const { user } = useAuth();
  const {
    leadSources,
    loading: sourcesLoading,
    addLeadSource,
    removeLeadSource,
  } = useSettings();
  const canManageSettings =
    user?.role === "Admin" ||
    Boolean(user?.permissions?.includes("settings.manage"));

  const [section, setSection] = useState<SectionId>("Profile");
  const [saved, setSaved] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [followReminders, setFollowReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [meetingAlerts, setMeetingAlerts] = useState(true);
  const [newSource, setNewSource] = useState("");
  const [sourceBusy, setSourceBusy] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [sourceOk, setSourceOk] = useState("");

  const active = SECTIONS.find((s) => s.id === section)!;

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleAddSource = async () => {
    const name = newSource.trim();
    if (!name) {
      setSourceError("Enter a source name");
      return;
    }
    setSourceBusy(true);
    setSourceError("");
    setSourceOk("");
    try {
      await addLeadSource(name);
      setNewSource("");
      setSourceOk(`“${name}” added`);
      window.setTimeout(() => setSourceOk(""), 2000);
    } catch (e) {
      setSourceError(
        e instanceof ApiError ? e.message : "Failed to add lead source",
      );
    } finally {
      setSourceBusy(false);
    }
  };

  const handleRemoveSource = async (name: string) => {
    if (!window.confirm(`Remove lead source “${name}”?`)) return;
    setSourceBusy(true);
    setSourceError("");
    setSourceOk("");
    try {
      await removeLeadSource(name);
      setSourceOk(`“${name}” removed`);
      window.setTimeout(() => setSourceOk(""), 2000);
    } catch (e) {
      setSourceError(
        e instanceof ApiError ? e.message : "Failed to remove lead source",
      );
    } finally {
      setSourceBusy(false);
    }
  };

  return (
    <AppShell>
      <Topbar
        title="Settings"
        subtitle="Workspace preferences and account controls"
        showSearch={false}
      />

      <section className="content settings-page">
        <PageHeader
          title="Settings"
          subtitle="Update profile, alerts, workspace defaults and security."
          crumbs={[{ label: "Settings" }]}
          actions={
            <>
              <Link href="/dashboard" className="btn btn-secondary dash-cta">
                Back to Dashboard
              </Link>
              <button
                type="button"
                className="btn btn-primary dash-cta"
                onClick={handleSave}
              >
                {saved ? "Saved" : "Save Changes"}
              </button>
            </>
          }
        />

        <div className="settings-layout">
          <aside className="settings-nav">
            <div className="settings-nav-head">
              <div className="settings-nav-avatar">
                {user?.initials || "—"}
              </div>
              <div>
                <strong>{user?.name || "User"}</strong>
                <span>{user?.role || ""}</span>
              </div>
            </div>

            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={section === item.id ? "active" : undefined}
                onClick={() => setSection(item.id)}
              >
                <span className="settings-nav-icon">
                  <SectionIcon name={item.icon} />
                </span>
                <span>
                  <em>{item.id}</em>
                  <small>{item.hint}</small>
                </span>
              </button>
            ))}
          </aside>

          <div className="settings-panel">
            <div className="settings-panel-head">
              <div>
                <h2>{active.id}</h2>
                <p>{active.hint}</p>
              </div>
              {section !== "Workspace" ? (
                <button
                  type="button"
                  className="btn btn-primary dash-cta"
                  onClick={handleSave}
                >
                  {saved ? "Saved" : "Save"}
                </button>
              ) : null}
            </div>

            {section === "Profile" ? (
              <div className="settings-body">
                <div className="settings-profile-banner">
                  <div className="settings-nav-avatar lg">
                    {user?.initials || "—"}
                  </div>
                  <div>
                    <h3>{user?.name || "User"}</h3>
                    <p>
                      {user?.email || "—"}
                      {user?.phone ? ` · +91 ${user.phone}` : ""}
                    </p>
                  </div>
                  <button type="button" className="btn btn-secondary dash-cta">
                    Change Photo
                  </button>
                </div>

                <div className="settings-form">
                  <div className="field">
                    <label>Full Name</label>
                    <input
                      className="input"
                      defaultValue={user?.name || ""}
                      readOnly
                    />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      className="input"
                      defaultValue={user?.email || ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {section === "Notifications" ? (
              <div className="settings-body">
                <div className="settings-toggle-list">
                  <div className="settings-toggle-row">
                    <div>
                      <strong>Email alerts</strong>
                      <p>Get notified about important lead updates</p>
                    </div>
                    <button
                      type="button"
                      className={`switch ${emailAlerts ? "on" : ""}`}
                      onClick={() => setEmailAlerts((v) => !v)}
                      aria-pressed={emailAlerts}
                    >
                      <i />
                    </button>
                  </div>
                  <div className="settings-toggle-row">
                    <div>
                      <strong>Follow-up reminders</strong>
                      <p>Reminders for due and overdue follow-ups</p>
                    </div>
                    <button
                      type="button"
                      className={`switch ${followReminders ? "on" : ""}`}
                      onClick={() => setFollowReminders((v) => !v)}
                      aria-pressed={followReminders}
                    >
                      <i />
                    </button>
                  </div>
                  <div className="settings-toggle-row">
                    <div>
                      <strong>Meeting alerts</strong>
                      <p>Alerts when meetings are scheduled for today</p>
                    </div>
                    <button
                      type="button"
                      className={`switch ${meetingAlerts ? "on" : ""}`}
                      onClick={() => setMeetingAlerts((v) => !v)}
                      aria-pressed={meetingAlerts}
                    >
                      <i />
                    </button>
                  </div>
                  <div className="settings-toggle-row">
                    <div>
                      <strong>Weekly digest</strong>
                      <p>Summary of pipeline activity each week</p>
                    </div>
                    <button
                      type="button"
                      className={`switch ${weeklyDigest ? "on" : ""}`}
                      onClick={() => setWeeklyDigest((v) => !v)}
                      aria-pressed={weeklyDigest}
                    >
                      <i />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {section === "Workspace" ? (
              <div className="settings-body">
                <div className="settings-source-block">
                  <div className="settings-source-head">
                    <div>
                      <h3>Lead Sources</h3>
                      <p>
                        These options appear in Create Lead → Lead Source
                        dropdown. Add new sources anytime.
                      </p>
                    </div>
                  </div>

                  {sourceError ? (
                    <div className="cal-flash err">{sourceError}</div>
                  ) : null}
                  {sourceOk ? (
                    <div className="cal-flash ok">{sourceOk}</div>
                  ) : null}

                  {canManageSettings ? (
                    <div className="settings-source-add">
                      <input
                        className="input"
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        placeholder="e.g. Instagram, Referral, LinkedIn"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSource();
                          }
                        }}
                        disabled={sourceBusy}
                      />
                      <button
                        type="button"
                        className="btn btn-primary dash-cta"
                        onClick={handleAddSource}
                        disabled={sourceBusy}
                      >
                        {sourceBusy ? "Saving…" : "Add Source"}
                      </button>
                    </div>
                  ) : (
                    <p className="hint">
                      You can view lead sources. Ask an admin to add or remove
                      options.
                    </p>
                  )}

                  <ul className="settings-source-list">
                    {sourcesLoading && !leadSources.length ? (
                      <li className="muted">Loading sources…</li>
                    ) : null}
                    {leadSources.map((source) => (
                      <li key={source}>
                        <span>{source}</span>
                        {canManageSettings ? (
                          <button
                            type="button"
                            className="settings-source-remove"
                            onClick={() => handleRemoveSource(source)}
                            disabled={sourceBusy || leadSources.length <= 1}
                            title={
                              leadSources.length <= 1
                                ? "Keep at least one source"
                                : `Remove ${source}`
                            }
                          >
                            Remove
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="settings-form" style={{ marginTop: 22 }}>
                  <div className="field">
                    <label>Company Name</label>
                    <input className="input" defaultValue="TechCulture" />
                  </div>
                  <div className="field">
                    <label>Default Country Code</label>
                    <input className="input" defaultValue="+91" />
                  </div>
                  <div className="field">
                    <label>Timezone</label>
                    <select defaultValue="Asia/Kolkata">
                      <option>Asia/Kolkata</option>
                      <option>Asia/Dubai</option>
                      <option>UTC</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Currency</label>
                    <select defaultValue="INR">
                      <option>INR</option>
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            {section === "Security" ? (
              <div className="settings-body">
                <div className="settings-secure-note">
                  Use a strong password with at least 8 characters. Session logout
                  will connect with auth later.
                </div>
                <div className="settings-form">
                  <div className="field">
                    <label>Current Password</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="field">
                    <label>New Password</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="field full">
                    <label>Confirm New Password</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
