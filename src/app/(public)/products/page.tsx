import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/marketing/page-header";
import { ProductBrowser } from "@/components/marketing/product-browser";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse HBM cement, Dangote Cement, and other building materials supplied by YUSFAITH.",
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  return (
    <>
      <PageHeader eyebrow="Products" title="Catalogue">
        Search by name or filter by category. Entries marked as placeholders should be edited when product specifications are confirmed. Prices are not listed.
      </PageHeader>
      <Suspense fallback={<ProductBrowserFallback />}>
        <ProductBrowser searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function ProductBrowserFallback() {
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-6 py-10">
      <Skeleton className="h-11" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
