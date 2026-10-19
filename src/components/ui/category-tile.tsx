import Image from "next/image";
import Link from "next/link";

export function CategoryTile({
  index,
  name,
  summary,
  image,
  imageAlt,
  href,
}: {
  index: string;
  name: string;
  summary: string;
  image: string;
  imageAlt: string;
  href?: string;
}) {
  const body = (
    <article className="grid border border-line bg-base-100 sm:grid-cols-[7.5rem_1fr]">
      <div className="relative min-h-28 bg-neutral">
        <Image src={image} alt={imageAlt} fill className="object-cover" sizes="160px" />
      </div>
      <div className="p-5">
        <p className="text-xs tracking-[0.18em] text-primary">{index}</p>
        <h3 className="mt-2 font-display text-2xl text-ink">{name}</h3>
        <p className="mt-2 text-sm leading-6 text-base-content/75">{summary}</p>
      </div>
    </article>
  );

  if (!href) return body;

  return (
    <Link href={href} className="block hover:text-primary">
      {body}
    </Link>
  );
}
