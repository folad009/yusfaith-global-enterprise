import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessState } from "@/components/portal/access-state";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/badge";
import { formatNgn } from "@/lib/commerce/workflow-labels";
import { customerTypeLabel } from "@/lib/validation/customer";
import { canManageCustomers } from "@/lib/commerce/workflow";
import { customerScope } from "@/lib/portal/permissions";
import { getCustomer } from "@/server/customers";
import { authorizeSection } from "@/server/portal-session";

const notices: Record<string, string> = {
  created: "Customer saved.",
  updated: "Customer updated.",
};

export default function CustomerDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <Suspense>
      <CustomerDetail {...props} />
    </Suspense>
  );
}

async function CustomerDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const access = await authorizeSection("customers");
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
        <EmptyState title="No buyer profile is linked" description="This sign-in is not tied to a customer record." />
      </div>
    );
  }
  const { id } = await params;
  const { notice } = await searchParams;
  const customer = await getCustomer(id, scope.mode === "own" ? scope.customerId : undefined);
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title={customer.businessName}
        description={`${customer.contactPerson} · ${customerTypeLabel(customer.customerType)}`}
        action={
          canManageCustomers(access.actor.role) ? (
            <Link href={`/portal/customers/${customer.id}/edit`} className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
              Edit
            </Link>
          ) : null
        }
      />
      {notice && notices[notice] ? (
        <p role="status" className="mt-4 border border-line bg-base-100 px-4 py-3 text-sm text-ink">
          {notices[notice]}
        </p>
      ) : null}
      <dl className="mt-6 grid gap-4 border border-line bg-base-100 p-5 sm:grid-cols-2">
        <Item label="Phone" value={customer.phone} />
        <Item label="Email" value={customer.email} />
        <Item label="Location" value={customer.address} />
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">Status</dt>
          <dd className="mt-2">
            <StatusBadge status={customer.status} />
          </dd>
        </div>
      </dl>
      <section className="mt-8">
        <h2 className="font-display text-2xl text-ink">Order history</h2>
        {customer.orders.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No orders yet" description="Orders for this customer will appear here after they are recorded." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto border border-line bg-base-100">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead className="bg-base-200 text-xs uppercase tracking-[0.14em] text-base-content/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link href={`/portal/orders/${order.id}`} className="text-ink hover:text-primary">
                        {order.orderNumber}
                      </Link>
                    </td>
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
      </section>
    </div>
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
