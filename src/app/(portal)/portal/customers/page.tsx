import Link from "next/link";
import { Suspense } from "react";
import { AccessState } from "@/components/portal/access-state";
import { PageLinks, queryHref } from "@/components/portal/page-links";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/badge";
import { canManageCustomers } from "@/lib/commerce/workflow";
import { customerScope } from "@/lib/portal/permissions";
import { customerTypeLabel } from "@/lib/validation/customer";
import { authorizeSection } from "@/server/portal-session";
import { listCustomers } from "@/server/customers";

export default function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <Suspense>
      <Customers searchParams={searchParams} />
    </Suspense>
  );
}

async function Customers({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
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
        <EmptyState title="No buyer profile is linked" description="This sign-in is not tied to a customer record, so other buyers stay hidden." />
      </div>
    );
  }
  const result = await listCustomers(params, scope.mode === "own" ? scope.customerId : undefined);
  const filters = { q: params.q, status: params.status };

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title="Customers"
        description="Wholesale buyer profiles. Customer type is a classification and does not grant portal access."
        action={
          canManageCustomers(access.actor.role) ? (
            <Link href="/portal/customers/new" className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
              Add customer
            </Link>
          ) : null
        }
      />
      <form method="get" className="mt-6 grid gap-3 border border-line bg-base-100 p-4 md:grid-cols-3">
        <input name="q" defaultValue={params.q} aria-label="Search name, phone, or email" placeholder="Search name, phone, or email" className="input h-11 rounded-sm border-base-300 md:col-span-2" />
        <select name="status" aria-label="Customer status" defaultValue={params.status ?? ""} className="select h-11 min-h-11 rounded-sm border-base-300">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PENDING">Pending</option>
        </select>
        <button type="submit" className="btn btn-primary h-11 min-h-11 w-fit rounded-sm px-5">
          Apply
        </button>
      </form>
      {result.total === 0 ? (
        <div className="mt-6">
          <EmptyState title="No customers match" description="Change the search or add a wholesale customer profile." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-base-100">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead className="bg-base-200 text-xs uppercase tracking-[0.14em] text-base-content/60">
              <tr>
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((customer) => (
                <tr key={customer.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/portal/customers/${customer.id}`} className="font-medium text-ink hover:text-primary">
                      {customer.businessName}
                    </Link>
                    <p className="text-base-content/60">{customer.address}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{customer.contactPerson}</p>
                    <p className="text-base-content/60">{customer.phone}</p>
                  </td>
                  <td className="px-4 py-3">{customerTypeLabel(customer.customerType)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={customer.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PageLinks page={result.page} pageCount={result.pageCount} hrefFor={(page) => queryHref("/portal/customers", filters, page)} />
    </div>
  );
}
