import Link from "next/link";
import { Suspense } from "react";
import { AccessState } from "@/components/portal/access-state";
import { PageLinks, queryHref } from "@/components/portal/page-links";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/badge";
import { canCreateOrder } from "@/lib/commerce/workflow";
import { customerScope } from "@/lib/portal/permissions";
import { formatNgn, orderStatusLabels } from "@/lib/commerce/workflow-labels";
import { listOrders } from "@/server/orders";
import { authorizeSection } from "@/server/portal-session";

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <Suspense>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
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
        <EmptyState title="No buyer profile is linked" description="This sign-in is not tied to a customer record, so yard orders stay hidden." />
      </div>
    );
  }
  const result = await listOrders(params, scope.mode === "own" ? scope.customerId : undefined);
  if (!result) {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="No single active branch" description="Orders are shown for one active branch." />
      </div>
    );
  }
  const filters = { q: params.q, status: params.status };

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title="Orders"
        description={`Wholesale orders at ${result.branch.name}. Approval is a separate step, and creating an order does not reduce stock.`}
        action={
          canCreateOrder(access.actor.role) ? (
            <Link href="/portal/orders/new" className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
              New order
            </Link>
          ) : null
        }
      />
      <form method="get" className="mt-6 grid gap-3 border border-line bg-base-100 p-4 md:grid-cols-3">
        <input name="q" defaultValue={params.q} aria-label="Search order number or customer" placeholder="Search order number or customer" className="input h-11 rounded-sm border-base-300 md:col-span-2" />
        <select name="status" aria-label="Order status" defaultValue={params.status?.toUpperCase() ?? ""} className="select h-11 min-h-11 rounded-sm border-base-300">
          <option value="">All statuses</option>
          {Object.entries(orderStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary h-11 min-h-11 w-fit rounded-sm px-5">
          Apply
        </button>
      </form>
      {result.total === 0 ? (
        <div className="mt-6">
          <EmptyState title="No orders match" description="Change the search or record an order for an active customer." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-base-100">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead className="bg-base-200 text-xs uppercase tracking-[0.14em] text-base-content/60">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/portal/orders/${order.id}`} className="font-medium text-ink hover:text-primary">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.customer.businessName}</td>
                  <td className="px-4 py-3">{order.orderDate.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} kind="order" />
                  </td>
                  <td className="px-4 py-3">{formatNgn(order.subtotal.toString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PageLinks page={result.page} pageCount={result.pageCount} hrefFor={(page) => queryHref("/portal/orders", filters, page)} />
    </div>
  );
}
