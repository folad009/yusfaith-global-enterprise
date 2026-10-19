import Link from "next/link";

export function MetricCard({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string;
  detail: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-base-content/60">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-sm leading-5 text-base-content/70">{detail}</p>
    </>
  );
  if (!href) {
    return <article className="border border-line bg-base-100 p-5 shadow-rest">{body}</article>;
  }
  return (
    <Link href={href} className="block border border-line bg-base-100 p-5 shadow-rest hover:border-primary">
      {body}
    </Link>
  );
}
