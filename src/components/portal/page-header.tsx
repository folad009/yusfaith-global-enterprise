import type { ReactNode } from "react";

export function PortalPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-ink">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/70">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
