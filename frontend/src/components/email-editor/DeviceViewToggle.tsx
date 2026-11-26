"use client";

import { Monitor, Smartphone, Eye, RotateCcw } from "lucide-react";
import { DeviceView } from "./types";
import { cn } from "@/lib/utils";

interface DeviceViewToggleProps {
  deviceView: DeviceView;
  onDeviceViewChange: (view: DeviceView) => void;
  onPreviewClick?: () => void;
  isPreviewActive?: boolean;
  onResetClick?: () => void;
}

export const DeviceViewToggle: React.FC<DeviceViewToggleProps> = ({
  deviceView,
  onDeviceViewChange,
  onPreviewClick,
  isPreviewActive = false,
  onResetClick,
}) => {
  const handleDesktopClick = () => {
    if (isPreviewActive && onPreviewClick) onPreviewClick();
    onDeviceViewChange("desktop");
  };

  const handleMobileClick = () => {
    if (isPreviewActive && onPreviewClick) onPreviewClick();
    onDeviceViewChange("mobile");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-900/60">
        <button
          type="button"
          onClick={handleDesktopClick}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition",
            deviceView === "desktop" && !isPreviewActive
              ? "bg-white text-[#0b5cff] shadow-sm dark:bg-slate-800 dark:text-[#6b9fff]"
              : "text-slate-500 hover:bg-white/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          )}
          title="Desktop view"
        >
          <Monitor className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Desktop</span>
        </button>
        <button
          type="button"
          onClick={handleMobileClick}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition",
            deviceView === "mobile" && !isPreviewActive
              ? "bg-white text-[#0b5cff] shadow-sm dark:bg-slate-800 dark:text-[#6b9fff]"
              : "text-slate-500 hover:bg-white/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          )}
          title="Mobile view"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>

      {onPreviewClick ? (
        <button
          type="button"
          onClick={onPreviewClick}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition",
            isPreviewActive
              ? "border-[#0b5cff] bg-[#0b5cff] text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          )}
          title="Preview email"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
      ) : null}

      {onResetClick ? (
        <button
          type="button"
          onClick={onResetClick}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
          title="Clear all content"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      ) : null}
    </div>
  );
};
