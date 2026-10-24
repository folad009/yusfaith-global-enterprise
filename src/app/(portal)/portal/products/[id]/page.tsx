import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessState } from "@/components/portal/access-state";
import { ProductStatusControl } from "@/components/portal/product-status";
import { PortalPageHeader } from "@/components/portal/page-header";
import { canEditCatalogue } from "@/lib/portal/permissions";
import { categoryLabel } from "@/lib/validation/product";
import { authorizeSection } from "@/server/portal-session";
import { getProduct } from "@/server/products";

const notices: Record<string, string> = {
  created: "Product saved.",
  updated: "Product updated.",
  activated: "Product activated.",
  deactivated: "Product deactivated.",
};

export default function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <Suspense>
      <ProductDetail {...props} />
    </Suspense>
  );
}

async function ProductDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const access = await authorizeSection("products");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  const { id } = await params;
  const { notice } = await searchParams;
  const product = await getProduct(id);
  if (!product) notFound();
  if (access.actor.role === "wholesale_customer" && !product.active) notFound();
  const message = notice ? notices[notice] : null;

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title={product.name}
        description={`${product.brand} · ${categoryLabel(product.category)}`}
        action={
          <div className="flex flex-wrap gap-3">
            {canEditCatalogue(access.actor.role) ? (
              <>
                <Link href={`/portal/products/${product.id}/edit`} className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
                  Edit
                </Link>
                <ProductStatusControl id={product.id} active={product.active} />
              </>
            ) : null}
          </div>
        }
      />
      {message ? (
        <p role="status" className="mt-4 border border-line bg-base-100 px-4 py-3 text-sm text-ink">
          {message}
        </p>
      ) : null}
      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        {product.imageUrl ? <ProductImage src={product.imageUrl} alt={product.name} /> : (
          <div className="flex h-48 items-center justify-center border border-dashed border-line text-sm text-base-content/60">
            No image
          </div>
        )}
        <dl className="grid gap-4 sm:grid-cols-2">
          <Item label="SKU" value={product.sku} />
          <Item label="Unit" value={product.unit.charAt(0) + product.unit.slice(1).toLowerCase()} />
          <Item label="Catalogue price" value={formatNgn(product.sellingPrice.toString())} />
          <Item label="Status" value={product.active ? "Active" : "Inactive"} />
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">Description</dt>
            <dd className="mt-2 text-sm leading-6 text-ink">{product.description}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith("/")) {
    return (
      <Image src={src} alt={alt} width={640} height={384} className="h-48 w-full border border-line object-cover" />
    );
  }
  return (
    // Staff can store an https image address that is not known at build time.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-48 w-full border border-line object-cover" />
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">{label}</dt>
      <dd className="mt-2 text-sm text-ink">{value}</dd>
    </div>
  );
}

function formatNgn(value: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(value));
}
