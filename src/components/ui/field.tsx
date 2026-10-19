import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-sm border-base-300 bg-base-100 text-base-content shadow-none placeholder:text-base-content/40";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="text-sm text-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-sm text-base-content/60">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn("input block", control, className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea className={cn("textarea block", control, "min-h-28", className)} {...props} />
  );
}

export function SelectInput({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn("select block", control, className)} {...props} />;
}
