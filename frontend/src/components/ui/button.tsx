"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "destructive-outline";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  loadingText?: React.ReactNode;
}

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-[#0b5cff] text-white hover:bg-[#0947d6]",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  "destructive-outline":
    "btn-delete-outline border bg-transparent hover:bg-transparent",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "h-7 gap-1.5 px-2 text-xs",
  sm: "h-8 gap-1.5 px-2.5 text-xs",
  md: "h-9 gap-2 px-3.5 text-sm",
  lg: "h-10 gap-2 px-5 text-sm",
  icon: "h-8 w-8",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      loadingText = "Loading...",
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff]/30 disabled:pointer-events-none disabled:opacity-60",
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          {size !== "icon" && <span>{loadingText}</span>}
        </>
      ) : (
        children
      )}
    </button>
  )
);
Button.displayName = "Button";
