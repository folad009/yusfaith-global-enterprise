import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AccessState } from "@/components/portal/access-state";
import { StockForms } from "@/components/portal/stock-forms";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { canMoveStock } from "@/lib/portal/permissions";
import { authorizeSection } from "@/server/portal-session";
import { getInventory } from "@/server/inventory";

const notices: Record<string, string> = {
  received: "Receipt recorded. The on-hand quantity includes it.",
  adjusted: "Adjustment recorded. The on-hand quantity has been updated.",
};

export default function InventoryDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <Suspense>
      <InventoryDetail {...props} />
    </Suspense>
  );
}

async function InventoryDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const access = await authorizeSection("inventory");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  const { id } = await params;
  const { notice } = await searchParams;
  const result = await getInventory(id);
  if (!result) notFound();
  const { row, movements } = result;
  const message = notice ? notices[notice] : null;

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title={row.product.name}
        description={`${row.warehouse.name} · ${row.product.sku}. Only the on-hand quantity is tracked.`}
      />
      {message ? (
        <p role="status" className="mt-4 border border-line bg-base-100 px-4 py-3 text-sm text-ink">
          {message}
        </p>
      ) : null}
      <dl className="mt-6 grid gap-4 border border-line bg-base-100 p-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">On hand</dt>
          <dd className="mt-2 font-display text-3xl text-ink">{row.quantityOnHand.toString()}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">Reorder level</dt>
          <dd className="mt-2 font-display text-3xl text-ink">{row.reorderLevel.toString()}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">Level</dt>
          <dd className="mt-2 text-sm text-ink">
            {row.quantityOnHand.lte(row.reorderLevel) ? "Low stock" : "Above reorder"}
          </dd>
        </div>
      </dl>
      <div className="mt-6">
        {canMoveStock(access.actor.role) ? (
          <StockForms inventoryId={row.id} version={row.updatedAt.toISOString()} onHand={row.quantityOnHand.toString()} />
        ) : (
          <p className="border border-line bg-base-100 px-4 py-3 text-sm text-base-content/80">
            Inventory is visible for oversight. Stock receipts and adjustments are recorded by warehouse staff or a Super Admin.
          </p>
        )}
      </div>
      <section className="mt-8">
        <h2 className="font-display text-2xl text-ink">Movement history</h2>
        {movements.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No movements yet" description="Receipts and adjustments for this product and warehouse will appear here." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto border border-line bg-base-100">
            <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
              <thead className="bg-base-200 text-xs uppercase tracking-[0.14em] text-base-content/60">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-t border-line">
                    <td className="px-4 py-3">{movement.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                    <td className="px-4 py-3">{movement.type}</td>
                    <td className="px-4 py-3">{movement.quantity.toString()}</td>
                    <td className="px-4 py-3">{movement.reference}</td>
                    <td className="px-4 py-3">{movement.reason || "—"}</td>
                    <td className="px-4 py-3">{movement.createdBy.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
