"use client";

import { Fragment, useEffect, useState } from "react";
import { LEAD_STATUSES, PRODUCTS } from "@/lib/constants";
import { useUsers } from "@/context/UsersContext";
import SearchableSelect from "@/components/shared/SearchableSelect";
import SearchableMultiSelect from "@/components/shared/SearchableMultiSelect";
import type { LeadFormData, LeadStatus } from "@/types/lead";

type LeadFormProps = {
  form: LeadFormData;
  isEditing: boolean;
  onChange: (next: LeadFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

type FieldId =
  | "assigned"
  | "location"
  | "status"
  | "entity"
  | "website"
  | "owner"
  | "contact"
  | "products"
  | "followup"
  | "mobile"
  | "notes"
  | "email";

const STORAGE_KEY = "techculture-lead-form-order";

const DEFAULT_ORDER: FieldId[] = [
  "assigned",
  "location",
  "status",
  "entity",
  "website",
  "owner",
  "contact",
  "products",
  "followup",
  "mobile",
  "notes",
  "email",
];

function loadOrder(): FieldId[] {
  if (typeof window === "undefined") return DEFAULT_ORDER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ORDER;
    const parsed = JSON.parse(raw) as FieldId[];
    const valid = parsed.filter((id) => DEFAULT_ORDER.includes(id));
    const missing = DEFAULT_ORDER.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return DEFAULT_ORDER;
  }
}

export default function LeadForm({
  form,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}: LeadFormProps) {
  const { userNames } = useUsers();
  const [order, setOrder] = useState<FieldId[]>(DEFAULT_ORDER);
  const [dragId, setDragId] = useState<FieldId | null>(null);
  const [overId, setOverId] = useState<FieldId | null>(null);

  useEffect(() => {
    setOrder(loadOrder());
  }, []);

  const persistOrder = (next: FieldId[]) => {
    setOrder(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const set = <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => {
    onChange({ ...form, [key]: value });
  };

  const moveField = (from: FieldId, to: FieldId) => {
    if (from === to) return;
    const next = [...order];
    const fromIdx = next.indexOf(from);
    const toIdx = next.indexOf(to);
    if (fromIdx < 0 || toIdx < 0) return;
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, from);
    persistOrder(next);
  };

  const resetOrder = () => {
    persistOrder(DEFAULT_ORDER);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.products.length) {
      alert("Select at least one product.");
      return;
    }
    if (form.status === "Meeting" && !form.meetingDate) {
      alert("Meeting date is required.");
      return;
    }
    if (form.status === "Lost" && !form.lostDate) {
      alert("Lost date is required.");
      return;
    }
    if (form.status === "Completed" && !form.wonDate) {
      alert("Won / Completed date is required.");
      return;
    }
    onSubmit();
  };

  const renderFieldBody = (id: FieldId) => {
    switch (id) {
      case "assigned":
        return (
          <>
            <label>
              Assigned User <span className="required">*</span>
            </label>
            <SearchableSelect
              required
              value={form.assigned}
              options={userNames}
              placeholder="Select User"
              searchPlaceholder="Search users…"
              onChange={(v) => set("assigned", v)}
            />
          </>
        );
      case "location":
        return (
          <>
            <label>Location</label>
            <input
              className="input"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Enter location (City, State)"
            />
          </>
        );
      case "status":
        return (
          <>
            <label>
              Lead Status <span className="required">*</span>
            </label>
            <select
              required
              value={form.status}
              onChange={(e) => {
                const status = e.target.value as LeadStatus;
                onChange({
                  ...form,
                  status,
                  meetingType:
                    status === "Meeting"
                      ? form.meetingType || "Online"
                      : form.meetingType,
                });
              }}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </>
        );
      case "entity":
        return (
          <>
            <label>
              Entity Name <span className="required">*</span>
            </label>
            <input
              className="input"
              required
              value={form.entity}
              onChange={(e) => set("entity", e.target.value)}
              placeholder="Enter entity name"
            />
          </>
        );
      case "website":
        return (
          <>
            <label>Website</label>
            <input
              className="input"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="Enter website URL"
            />
          </>
        );
      case "owner":
        return (
          <>
            <label>
              Lead Owner <span className="required">*</span>
            </label>
            <SearchableSelect
              required
              value={form.owner}
              options={userNames}
              placeholder="Select Owner"
              searchPlaceholder="Search owners…"
              onChange={(v) => set("owner", v)}
            />
          </>
        );
      case "contact":
        return (
          <>
            <label>
              Contact Person Name <span className="required">*</span>
            </label>
            <input
              className="input"
              required
              value={form.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="Enter contact person name"
            />
          </>
        );
      case "products":
        return (
          <>
            <label>
              Products Interested <span className="required">*</span>
            </label>
            <SearchableMultiSelect
              values={form.products}
              options={[...PRODUCTS]}
              required
              placeholder="Select products…"
              searchPlaceholder="Search products…"
              onChange={(next) => set("products", next)}
            />
          </>
        );
      case "followup":
        return (
          <>
            <label>Follow-up Date</label>
            <input
              type="date"
              className="input"
              value={form.followup}
              onChange={(e) => set("followup", e.target.value)}
            />
          </>
        );
      case "mobile":
        return (
          <>
            <label>
              Mobile No <span className="required">*</span>
            </label>
            <div className="phone">
              <span className="phone-prefix">+91</span>
              <input
                className="input"
                required
                maxLength={10}
                value={form.mobile}
                onChange={(e) =>
                  set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="Enter mobile number"
              />
            </div>
          </>
        );
      case "notes":
        return (
          <>
            <label>Notes / Remarks</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Enter additional notes..."
            />
          </>
        );
      case "email":
        return (
          <>
            <label>Email Id</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Enter email id"
            />
          </>
        );
      default:
        return null;
    }
  };

  const statusExtras =
    form.status === "Meeting" ? (
      <div className="lead-status-extra">
        <div className="lead-status-extra-grid">
          <div className="field">
            <label>
              Meeting Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className="input"
              value={form.meetingDate}
              onChange={(e) => set("meetingDate", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Meeting Type</label>
            <div className="radio-group radio-group-inline">
              <label>
                <input
                  type="radio"
                  name="meetingType"
                  checked={form.meetingType !== "Offline"}
                  onChange={() =>
                    onChange({
                      ...form,
                      meetingType: "Online",
                    })
                  }
                />
                Online
              </label>
              <label>
                <input
                  type="radio"
                  name="meetingType"
                  checked={form.meetingType === "Offline"}
                  onChange={() =>
                    onChange({
                      ...form,
                      meetingType: "Offline",
                      meetingLink: "",
                    })
                  }
                />
                Offline
              </label>
            </div>
          </div>
          {form.meetingType !== "Offline" ? (
            <div className="field lead-meet-link-field">
              <label>Meeting Link</label>
              {form.meetingLink ? (
                <div className="meet-link-row">
                  <input className="input" readOnly value={form.meetingLink} />
                  <button
                    type="button"
                    className="btn btn-secondary dash-cta"
                    onClick={() => {
                      navigator.clipboard?.writeText(form.meetingLink);
                      alert("Meeting link copied");
                    }}
                  >
                    Copy
                  </button>
                  <a
                    className="btn btn-primary dash-cta"
                    href={form.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </div>
              ) : (
                <p className="role-dropdown-hint">
                  Google Meet link will be created automatically when you save
                  (connect Google Calendar first).
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    ) : form.status === "Lost" ? (
      <div className="lead-status-extra">
        <div className="lead-status-extra-grid">
          <div className="field">
            <label>
              Lost Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className="input"
              value={form.lostDate}
              onChange={(e) => set("lostDate", e.target.value)}
            />
          </div>
        </div>
      </div>
    ) : form.status === "Completed" ? (
      <div className="lead-status-extra">
        <div className="lead-status-extra-grid">
          <div className="field">
            <label>
              Won / Completed Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className="input"
              value={form.wonDate}
              onChange={(e) => set("wonDate", e.target.value)}
            />
          </div>
        </div>
      </div>
    ) : null;

  return (
    <form className="lead-form-dnd" onSubmit={handleSubmit}>
      <div className="form-dnd-bar">
        <p>
          Drag the <strong>⋮⋮</strong> handle to reorder fields. Layout is saved
          on this browser.
        </p>
        <button
          type="button"
          className="btn btn-secondary dash-cta"
          onClick={resetOrder}
        >
          Reset Layout
        </button>
      </div>

      <div className="form-grid lead-form-grid">
        {order.map((id) => (
          <Fragment key={id}>
            <div
              className={[
                "field",
                "dnd-field",
                dragId === id ? "is-dragging" : "",
                overId === id && dragId !== id ? "is-over" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragId && dragId !== id) setOverId(id);
              }}
              onDragLeave={() => {
                if (overId === id) setOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) moveField(dragId, id);
                setDragId(null);
                setOverId(null);
              }}
            >
              <button
                type="button"
                className="dnd-handle"
                draggable
                title="Drag to reorder"
                aria-label={`Drag ${id} field`}
                onDragStart={(e) => {
                  setDragId(id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
              >
                <span />
                <span />
                <span />
              </button>
              <div className="dnd-field-body">{renderFieldBody(id)}</div>
            </div>
            {id === "status" ? statusExtras : null}
          </Fragment>
        ))}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary dash-cta"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary dash-cta">
            {isEditing ? "Update Lead" : "Save Lead"}
          </button>
        </div>
      </div>
    </form>
  );
}
