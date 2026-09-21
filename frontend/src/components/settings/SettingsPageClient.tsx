"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";

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
  const [section, setSection] = useState<SectionId>("Profile");
  const [saved, setSaved] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [followReminders, setFollowReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [meetingAlerts, setMeetingAlerts] = useState(true);

  const active = SECTIONS.find((s) => s.id === section)!;

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
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
              <div className="settings-nav-avatar">AS</div>
              <div>
                <strong>Amit Sharma</strong>
                <span>Sales Lead</span>
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
              <button
                type="button"
                className="btn btn-primary dash-cta"
                onClick={handleSave}
              >
                {saved ? "Saved" : "Save"}
              </button>
            </div>

            {section === "Profile" ? (
              <div className="settings-body">
                <div className="settings-profile-banner">
                  <div className="settings-nav-avatar lg">AS</div>
                  <div>
                    <h3>Amit Sharma</h3>
                    <p>amit@techculture.in · +91 9876500001</p>
                  </div>
                  <button type="button" className="btn btn-secondary dash-cta">
                    Change Photo
                  </button>
                </div>

                <div className="settings-form">
                  <div className="field">
                    <label>Full Name</label>
                    <input className="input" defaultValue="Amit Sharma" />
                  </div>
                  <div className="field">
                    <label>Role</label>
                    <input className="input" defaultValue="Sales Lead" />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input className="input" defaultValue="amit@techculture.in" />
                  </div>
                  <div className="field">
                    <label>Mobile</label>
                    <input className="input" defaultValue="9876500001" />
                  </div>
                  <div className="field full">
                    <label>Bio</label>
                    <textarea defaultValue="Leading TechCulture enterprise and SMB lead desk." />
                  </div>
                </div>
              </div>
            ) : null}

            {section === "Notifications" ? (
              <div className="settings-body">
                <div className="settings-toggle-list">
                  <div className="toggle-row">
                    <div>
                      <h4>Email alerts</h4>
                      <p>Get notified when a lead is assigned to you</p>
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
                  <div className="toggle-row">
                    <div>
                      <h4>Follow-up reminders</h4>
                      <p>Morning digest of due and overdue tasks</p>
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
                  <div className="toggle-row">
                    <div>
                      <h4>Meeting alerts</h4>
                      <p>Reminders before scheduled online/offline meetings</p>
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
                  <div className="toggle-row">
                    <div>
                      <h4>Weekly performance digest</h4>
                      <p>Summary of wins, losses and pipeline changes</p>
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
                <div className="settings-form">
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
                  <div className="field">
                    <label>Fiscal Year Start</label>
                    <select defaultValue="April">
                      <option>April</option>
                      <option>January</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Default Lead Status</label>
                    <select defaultValue="New">
                      <option>New</option>
                      <option>In Process</option>
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
                    <input className="input" type="password" placeholder="••••••••" />
                  </div>
                  <div className="field">
                    <label>New Password</label>
                    <input className="input" type="password" placeholder="••••••••" />
                  </div>
                  <div className="field full">
                    <label>Confirm New Password</label>
                    <input className="input" type="password" placeholder="••••••••" />
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
