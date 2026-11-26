"use client";

import { useEffect, useRef } from "react";

type ToastProps = {
  message: string;
  tone?: "success" | "error";
  duration?: number;
  onClose: () => void;
};

export default function Toast({ message, tone = "success", duration = 3200, onClose }: ToastProps) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [duration, message]);

  return (
    <div className={`app-toast app-toast-${tone}`} role="status" aria-live="polite">
      <span className="app-toast-icon" aria-hidden>
        {tone === "success" ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M12 7v6m0 4h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span className="app-toast-text">{message}</span>
      <button type="button" className="app-toast-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}
