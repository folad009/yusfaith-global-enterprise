import { Search } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function SearchField({ className, ...props }: ComponentProps<"input">) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">Search</span>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-base-content/50"
        aria-hidden
      />
      <input
        type="search"
        className={cn(
          "input h-11 w-full rounded-sm border-base-300 bg-base-100 pr-3 pl-10 shadow-none",
          className,
        )}
        {...props}
      />
    </label>
  );
}
