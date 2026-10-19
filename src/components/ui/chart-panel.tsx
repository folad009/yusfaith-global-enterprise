import type { ReactNode } from "react";

export function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-line bg-base-100 p-5 shadow-rest">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="mt-1 text-sm text-base-content/70">{description}</p>
      <div className="mt-5 h-64">{children}</div>
    </section>
  );
}
