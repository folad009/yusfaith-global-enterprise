import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "btn-primary",
  secondary:
    "border-neutral bg-transparent text-neutral hover:border-neutral hover:bg-neutral hover:text-neutral-content",
} as const;

const base =
  "btn h-11 min-h-11 rounded-sm px-5 text-sm font-medium tracking-wide shadow-none";

type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
}
