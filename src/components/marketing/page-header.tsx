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
    <header className="border-b border-[#1c1b19]/15 bg-[#e7e5e2]" data-reveal>
      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <p className="font-stamp text-sm font-semibold uppercase tracking-[0.28em] text-[#e15a12]">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl font-stamp text-5xl font-extrabold uppercase leading-[0.88] tracking-tight text-ink md:text-7xl">
          {title}
        </h1>
        <div className="mt-5 max-w-2xl text-base leading-7 text-base-content/75">{children}</div>
      </div>
    </header>
  );
}
