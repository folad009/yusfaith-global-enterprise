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
    <article className="flex h-full flex-col bg-[#f7f4ef]">
      <div className="relative aspect-[4/3] bg-base-200">
        <Image src={image} alt={imageAlt} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 100vw" />
        <span className="absolute top-0 left-0 h-1 w-12 bg-[#e15a12]" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="font-stamp text-sm font-semibold uppercase tracking-[0.18em] text-[#e15a12]">
          {brand}
        </p>
        <h3 className="font-stamp text-3xl font-bold uppercase leading-none text-ink">{name}</h3>
        <p className="text-sm leading-6 text-base-content/75">{detail}</p>
        <p className="mt-auto text-sm font-medium text-ink">{unit}</p>
      </div>
    </article>
  );

  if (!href) return body;

  return (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  );
}
