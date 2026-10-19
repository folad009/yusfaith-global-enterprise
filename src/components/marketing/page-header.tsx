export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-6xl">
          {title}
        </h1>
        <div className="mt-5 max-w-2xl text-base leading-7 text-base-content/75">{children}</div>
      </div>
    </header>
  );
}
