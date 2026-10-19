import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { getCategory, getProduct, products } from "@/lib/catalog";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = products.filter((item) => item.category === product.category && item.slug !== product.slug);

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-2 lg:py-16">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-base-content/60">{product.brand}</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-ink md:text-5xl">{product.name}</h1>
        <p className="mt-4 text-base leading-7 text-base-content/75">{product.description}</p>
        <dl className="mt-6 grid gap-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-base-content/60">Category</dt>
            <dd>{category?.name}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-base-content/60">Unit</dt>
            <dd>{product.unit}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={`/quote?product=${product.slug}`}>Request a quote</ButtonLink>
          <ButtonLink href="/products" variant="secondary">
            Back to catalogue
          </ButtonLink>
        </div>
        {related.length > 0 ? (
          <div className="mt-10">
            <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-base-content/60">Related</h2>
            <ul className="mt-3 grid gap-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/products/${item.slug}`} className="text-ink hover:text-primary">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
