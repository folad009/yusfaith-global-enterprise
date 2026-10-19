import Link from "next/link";
import { Suspense } from "react";
import { AccessState } from "@/components/portal/access-state";
import { PageLinks, queryHref } from "@/components/portal/page-links";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/badge";
import { formatNgn, quoteStatusLabels } from "@/lib/commerce/workflow-labels";
import { canManageQuotes } from "@/lib/commerce/workflow";
import { customerScope } from "@/lib/portal/permissions";
import { authorizeSection } from "@/server/portal-session";
import { listQuotes } from "@/server/quotes";

export default function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <Suspense>
      <Quotes searchParams={searchParams} />
    </Suspense>
  );
}

async function Quotes({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const access = await authorizeSection("quotes");
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
        <EmptyState
          title="No buyer profile is linked"
          description="This sign-in is not tied to a customer record, so yard quotations stay hidden."
        />
      </div>
    );
  }
  const result = await listQuotes(params, scope.mode === "own" ? scope.customerId : undefined);
  if (!result) {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="No single active branch" description="Quotations are shown for one active branch." />
      </div>
    );
  }
  const filters = { q: params.q, status: params.status };

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title="Quotations"
        description={`Prices on ${result.branch.name} quotations are stored on each line. They are not taken from a browser total.`}
        action={
          canManageQuotes(access.actor.role) ? (
            <Link href="/portal/quotes/new" className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
              New quotation
            </Link>
          ) : null
        }
      />
      <form method="get" className="mt-6 grid gap-3 border border-line bg-base-100 p-4 md:grid-cols-3">
        <input name="q" defaultValue={params.q} aria-label="Search quote number or customer" placeholder="Search quote number or customer" className="input h-11 rounded-sm border-base-300 md:col-span-2" />
        <select name="status" aria-label="Quote status" defaultValue={params.status?.toUpperCase() ?? ""} className="select h-11 min-h-11 rounded-sm border-base-300">
          <option value="">All statuses</option>
          {Object.entries(quoteStatusLabels).map(([value, label]) => (
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
          <EmptyState title="No quotations match" description="Change the search or create a quotation for an active customer." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-base-100">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead className="bg-base-200 text-xs uppercase tracking-[0.14em] text-base-content/60">
              <tr>
                <th className="px-4 py-3 font-medium">Quote</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((quote) => (
                <tr key={quote.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/portal/quotes/${quote.id}`} className="font-medium text-ink hover:text-primary">
                      {quote.quoteNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{quote.customer.businessName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={quote.status} kind="quote" />
                  </td>
                  <td className="px-4 py-3">{formatNgn(quote.subtotal.toString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PageLinks page={result.page} pageCount={result.pageCount} hrefFor={(page) => queryHref("/portal/quotes", filters, page)} />
    </div>
  );
}
