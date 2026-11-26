import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#0b5cff] focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[88px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#0b5cff] focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300",
        className
      )}
      {...props}
    />
  );
}

export function Checkbox({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-slate-300 text-[#0b5cff] focus:ring-[#0b5cff]/30 dark:border-slate-600 dark:bg-slate-900",
        className
      )}
      {...props}
    />
  );
}
