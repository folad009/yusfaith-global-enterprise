import Image from "next/image";
import Link from "next/link";

export function ProductCard({
  name,
  brand,
  detail,
  unit,
  image,
  imageAlt,
  href,
}: {
  name: string;
  brand: string;
  detail: string;
  unit: string;
  image: string;
  imageAlt: string;
  href?: string;
}) {
  const body = (
    <article className="flex h-full flex-col border border-line bg-base-100 shadow-rest">
      <div className="relative aspect-[4/3] bg-base-200">
        <Image src={image} alt={imageAlt} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 100vw" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-base-content/60">
          {brand}
        </p>
        <h3 className="font-display text-2xl leading-tight text-ink">{name}</h3>
        <p className="text-sm leading-6 text-base-content/75">{detail}</p>
        <p className="mt-auto text-sm font-medium text-ink">{unit}</p>
      </div>
    </article>
  );

  if (!href) return body;

  return (
    <Link href={href} className="block h-full hover:border-primary">
      {body}
    </Link>
  );
}
