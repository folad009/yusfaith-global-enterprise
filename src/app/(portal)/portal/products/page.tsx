import Link from "next/link";
import { Suspense } from "react";
import { AccessState } from "@/components/portal/access-state";
import { PageLinks, queryHref } from "@/components/portal/page-links";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { canEditCatalogue } from "@/lib/portal/permissions";
import { allowDemoDashboard } from "@/lib/portal/demo";
import { isClerkConfigured } from "@/lib/portal/clerk";
import { categoryLabel, productCategories } from "@/lib/validation/product";
import { authorizeSection } from "@/server/portal-session";
import { listProducts } from "@/server/products";

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <Suspense>
      <Products searchParams={searchParams} />
    </Suspense>
  );
}

async function Products({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const access = await authorizeSection("products");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  const catalogueOnly = access.actor.role === "wholesale_customer";
  const filters = {
    q: params.q,
    category: params.category,
    brand: params.brand,
    active: catalogueOnly ? "true" : params.active,
    page: params.page,
  };
  const result = await listProducts(filters);

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title="Products"
        description="Catalogue prices are current selling prices in NGN. Recorded order lines keep the price they were given."
        action={
          canEditCatalogue(access.actor.role) ? (
            <Link href="/portal/products/new" className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
              Add product
            </Link>
          ) : null
        }
      />
      {allowDemoDashboard() && !isClerkConfigured() ? <DemoNote /> : null}
      <form method="get" className="mt-6 grid gap-3 border border-line bg-base-100 p-4 md:grid-cols-4">
        <input name="q" defaultValue={params.q} aria-label="Search name or SKU" placeholder="Search name or SKU" className="input h-11 rounded-sm border-base-300 md:col-span-2" />
        <select name="category" aria-label="Category" defaultValue={params.category ?? ""} className="select h-11 min-h-11 rounded-sm border-base-300">
          <option value="">All categories</option>
          {productCategories.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
        <select name="brand" aria-label="Brand" defaultValue={params.brand ?? ""} className="select h-11 min-h-11 rounded-sm border-base-300">
          <option value="">All brands</option>
          {result.brands.map((brand) => (
            <option key={brand}>{brand}</option>
          ))}
        </select>
        <select name="active" aria-label="Catalogue status" defaultValue={params.active ?? ""} className="select h-11 min-h-11 rounded-sm border-base-300">
          <option value="">Active and inactive</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button type="submit" className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
          Apply
        </button>
      </form>
      {result.total === 0 ? (
        <div className="mt-6">
          <EmptyState title="No products match" description="Change the search or filters, or add a product to the catalogue." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-base-100">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead className="bg-base-200 text-xs uppercase tracking-[0.14em] text-base-content/60">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((product) => (
                <tr key={product.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/portal/products/${product.id}`} className="font-medium text-ink hover:text-primary">
                      {product.name}
                    </Link>
                    <p className="text-base-content/60">{product.brand}</p>
                  </td>
                  <td className="px-4 py-3">{product.sku}</td>
                  <td className="px-4 py-3">{categoryLabel(product.category)}</td>
                  <td className="px-4 py-3">{formatNgn(product.sellingPrice.toString())}</td>
                  <td className="px-4 py-3">{product.active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PageLinks page={result.page} pageCount={result.pageCount} hrefFor={(page) => queryHref("/portal/products", filters, page)} />
    </div>
  );
}

function DemoNote() {
  return (
    <p className="mt-4 border border-line bg-base-200 px-4 py-3 text-sm text-base-content/80">
      Demo access is on. Changes are stored as the demo operations profile, not as a Clerk user chosen in the sidebar.
    </p>
  );
}

function formatNgn(value: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(value));
}
