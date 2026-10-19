import Link from "next/link";
import { Suspense } from "react";
import { AccessState } from "@/components/portal/access-state";
import { PageLinks, queryHref } from "@/components/portal/page-links";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { authorizeSection } from "@/server/portal-session";
import { listInventory } from "@/server/inventory";

export default function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <Suspense>
      <Inventory searchParams={searchParams} />
    </Suspense>
  );
}

async function Inventory({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const access = await authorizeSection("inventory");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  const result = await listInventory(params);
  if (!result) {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="No single active branch" description="Inventory is shown for one active branch." />
      </div>
    );
  }
  const filters = { q: params.q, warehouse: params.warehouse, low: params.low };

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title="Inventory"
        description={`On-hand quantities at ${result.branch.name}. Creating an order does not reserve or reduce stock. Stock changes only when a receipt or adjustment is recorded.`}
      />
      <form method="get" className="mt-6 grid gap-3 border border-line bg-base-100 p-4 md:grid-cols-4">
        <input name="q" defaultValue={params.q} aria-label="Search product or SKU" placeholder="Search product or SKU" className="input h-11 rounded-sm border-base-300 md:col-span-2" />
        <select name="warehouse" aria-label="Warehouse" defaultValue={params.warehouse ?? ""} className="select h-11 min-h-11 rounded-sm border-base-300">
          <option value="">All warehouses</option>
          {result.warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
        <select name="low" aria-label="Stock level" defaultValue={params.low ?? ""} className="select h-11 min-h-11 rounded-sm border-base-300">
          <option value="">All stock levels</option>
          <option value="1">Low stock only</option>
        </select>
        <button type="submit" className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
          Apply
        </button>
      </form>
      {result.total === 0 ? (
        <div className="mt-6">
          <EmptyState title="No inventory rows" description="Nothing in this branch matches the current search or low-stock filter." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-base-100">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead className="bg-base-200 text-xs uppercase tracking-[0.14em] text-base-content/60">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Warehouse</th>
                <th className="px-4 py-3 font-medium">On hand</th>
                <th className="px-4 py-3 font-medium">Reorder</th>
                <th className="px-4 py-3 font-medium">Level</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => {
                const low = row.quantityOnHand.lte(row.reorderLevel);
                return (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link href={`/portal/inventory/${row.id}`} className="font-medium text-ink hover:text-primary">
                        {row.product.name}
                      </Link>
                      <p className="text-base-content/60">{row.product.sku}</p>
                    </td>
                    <td className="px-4 py-3">{row.warehouse.name}</td>
                    <td className="px-4 py-3">{row.quantityOnHand.toString()}</td>
                    <td className="px-4 py-3">{row.reorderLevel.toString()}</td>
                    <td className="px-4 py-3">{low ? "Low stock" : "Above reorder"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <PageLinks
        page={result.page}
        pageCount={result.pageCount}
        hrefFor={(page) => queryHref("/portal/inventory", filters, page)}
      />
    </div>
  );
}
