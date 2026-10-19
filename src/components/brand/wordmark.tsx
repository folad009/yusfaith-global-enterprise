import Link from "next/link";
import { cn } from "@/lib/cn";

export function Wordmark({
  tone = "dark",
  href = "/",
}: {
  tone?: "dark" | "light";
  href?: string;
}) {
  return (
    <Link href={href} className={cn("block leading-none", tone === "light" ? "text-paper" : "text-ink")}>
      <span className="font-display text-lg font-semibold tracking-[0.18em]">YUSFAITH</span>
      <span className="mt-1 block text-[10px] tracking-[0.22em] uppercase opacity-70">
        Global Enterprises
      </span>
    </Link>
  );
}
