import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessState } from "@/components/portal/access-state";
import { PrintButton } from "@/components/portal/print-button";
import { OrderStatusActions } from "@/components/portal/status-actions";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/badge";
import { allowedOrderMoves, canEditPendingOrder } from "@/lib/commerce/workflow";
import { formatNgn, orderStatusLabel } from "@/lib/commerce/workflow-labels";
import { customerScope } from "@/lib/portal/permissions";
import { getOrder } from "@/server/orders";
import { authorizeSection } from "@/server/portal-session";

const notices: Record<string, string> = {
  created: "Order saved. It is pending approval.",
  updated: "Order updated.",
  status: "Order status updated.",
  "from-quote": "Order created from the accepted quotation. It is pending approval.",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const access = await authorizeSection("orders");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  const scope = customerScope(access.actor);
  if (scope.mode === "none") {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="No buyer profile is linked" description="This sign-in is not tied to a customer record, so this order stays hidden." />
      </div>
    );
  }
  const { id } = await params;
  const { notice } = await searchParams;
  const result = await getOrder(id, scope.mode === "own" ? scope.customerId : undefined);
  if (!result) notFound();
  const { order, history } = result;
  const moves = allowedOrderMoves(access.actor.role, order.status);

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title={order.orderNumber}
        description={`${order.customer.businessName} · ${order.orderDate.toISOString().slice(0, 10)}`}
        action={
          <div className="flex flex-wrap gap-3 print:hidden">
            {order.status === "DRAFT" && canEditPendingOrder(access.actor.role) ? (
              <Link href={`/portal/orders/${order.id}/edit`} className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
                Edit
              </Link>
            ) : null}
            <PrintButton label="Print order" />
          </div>
        }
      />
      {notice && notices[notice] ? (
        <p role="status" className="mt-4 border border-line bg-base-100 px-4 py-3 text-sm text-ink print:hidden">
          {notices[notice]}
        </p>
      ) : null}
      <div className="mt-6">
        <StatusBadge status={order.status} kind="order" />
      </div>
      <div className="mt-4">
        <OrderStatusActions id={order.id} moves={[...moves]} />
      </div>
      <article className="mt-6 border border-line bg-base-100 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-base-content/60">YUSFAITH Global Enterprises</p>
        <h2 className="mt-2 font-display text-3xl text-ink">Order summary</h2>
        <p className="mt-2 text-sm text-base-content/70">
          This summary is not an invoice and it does not record a payment. Stock is unchanged by this order.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Item label="Customer" value={order.customer.businessName} />
          <Item label="Contact" value={`${order.customer.contactPerson} · ${order.customer.phone}`} />
          <Item label="Location" value={order.customer.address} />
          <Item label="Recorded by" value={order.createdBy.name} />
          {order.quote ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">Quotation</dt>
              <dd className="mt-1 text-sm">
                <Link href={`/portal/quotes/${order.quote.id}`} className="text-ink hover:text-primary">
                  {order.quote.quoteNumber}
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-base-content/60">
              <tr>
                <th className="py-2 font-medium">Product</th>
                <th className="py-2 font-medium">Qty</th>
                <th className="py-2 font-medium">Agreed price</th>
                <th className="py-2 font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="py-3">
                    {item.product.name}
                    <span className="block text-base-content/60">{item.product.sku}</span>
                  </td>
                  <td className="py-3">{item.quantity.toString()}</td>
                  <td className="py-3">{formatNgn(item.unitPrice.toString())}</td>
                  <td className="py-3">{formatNgn(item.lineTotal.toString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-right font-display text-2xl text-ink">Subtotal {formatNgn(order.subtotal.toString())}</p>
        {order.notes ? <p className="mt-4 text-sm leading-6 text-ink">{order.notes}</p> : null}
        {order.status === "CANCELLED" && order.cancellationReason ? (
          <p className="mt-4 text-sm text-ink">Cancellation reason: {order.cancellationReason}</p>
        ) : null}
        {order.isDemo ? <p className="mt-4 text-sm text-base-content/70">Demo order. Sample prices are not current market prices.</p> : null}
      </article>
      <section className="mt-8 print:hidden">
        <h2 className="font-display text-2xl text-ink">History</h2>
        {history.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No history yet" description="Approval and later status changes will show the person and time." />
          </div>
        ) : (
          <ul className="mt-4 grid gap-3">
            {history.map((entry) => (
              <li key={entry.id} className="border border-line bg-base-100 px-4 py-3 text-sm">
                <p className="text-ink">
                  {entry.actor.name} · {entry.action} · {entry.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                </p>
                <p className="text-base-content/70">{historyLine(entry.metadata)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}

function historyLine(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  const record = metadata as Record<string, unknown>;
  const reason = typeof record.reason === "string" ? ` Reason: ${record.reason}` : "";
  if (typeof record.from === "string" && typeof record.to === "string") {
    return `${orderStatusLabel(record.from)} to ${orderStatusLabel(record.to)}.${reason}`;
  }
  if (typeof record.orderNumber === "string") return record.orderNumber;
  return reason;
}
