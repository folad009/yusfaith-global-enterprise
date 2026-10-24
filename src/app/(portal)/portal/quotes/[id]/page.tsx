import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessState } from "@/components/portal/access-state";
import { PrintButton } from "@/components/portal/print-button";
import { QuoteOrderButton } from "@/components/portal/quote-order-button";
import { QuoteStatusActions } from "@/components/portal/status-actions";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/badge";
import { allowedQuoteMoves, canCreateOrder, canManageQuotes } from "@/lib/commerce/workflow";
import { formatNgn, quoteStatusLabel } from "@/lib/commerce/workflow-labels";
import { authorizeSection } from "@/server/portal-session";
import { customerScope } from "@/lib/portal/permissions";
import { getQuote } from "@/server/quotes";

const notices: Record<string, string> = {
  created: "Quotation saved.",
  updated: "Quotation updated.",
  status: "Quotation status updated.",
};

export default function QuoteDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <Suspense>
      <QuoteDetail {...props} />
    </Suspense>
  );
}

async function QuoteDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
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
        <EmptyState title="No buyer profile is linked" description="This sign-in is not tied to a customer record, so this quotation stays hidden." />
      </div>
    );
  }
  const { id } = await params;
  const { notice } = await searchParams;
  const result = await getQuote(id, scope.mode === "own" ? scope.customerId : undefined);
  if (!result) notFound();
  const { quote, history } = result;
  const moves = canManageQuotes(access.actor.role) ? [...allowedQuoteMoves(quote.status)] : [];

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title={quote.quoteNumber}
        description={`${quote.customer.businessName} · expires ${quote.expiryDate.toISOString().slice(0, 10)}`}
        action={
          <div className="flex flex-wrap gap-3 print:hidden">
            {quote.status === "DRAFT" && canManageQuotes(access.actor.role) ? (
              <Link href={`/portal/quotes/${quote.id}/edit`} className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
                Edit
              </Link>
            ) : null}
            <PrintButton label="Print quotation" />
          </div>
        }
      />
      {notice && notices[notice] ? (
        <p role="status" className="mt-4 border border-line bg-base-100 px-4 py-3 text-sm text-ink print:hidden">
          {notices[notice]}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={quote.status} kind="quote" />
        {quote.order ? (
          <Link href={`/portal/orders/${quote.order.id}`} className="text-sm text-ink hover:text-primary">
            Order {quote.order.orderNumber}
          </Link>
        ) : null}
      </div>
      <div className="mt-4">
        <QuoteStatusActions id={quote.id} moves={moves} />
        {quote.status === "ACCEPTED" && !quote.order && canCreateOrder(access.actor.role) ? (
          <div className="mt-4">
            <QuoteOrderButton quoteId={quote.id} />
          </div>
        ) : null}
      </div>
      <article className="mt-6 border border-line bg-base-100 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-base-content/60">YUSFAITH Global Enterprises</p>
        <h2 className="mt-2 font-display text-3xl text-ink">Quotation</h2>
        <p className="mt-2 text-sm text-base-content/70">This is not an invoice and it does not confirm payment or delivery.</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Item label="Customer" value={quote.customer.businessName} />
          <Item label="Contact" value={`${quote.customer.contactPerson} · ${quote.customer.phone}`} />
          <Item label="Location" value={quote.customer.address} />
          <Item label="Email" value={quote.customer.email} />
        </dl>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-base-content/60">
              <tr>
                <th className="py-2 font-medium">Product</th>
                <th className="py-2 font-medium">Qty</th>
                <th className="py-2 font-medium">Unit price</th>
                <th className="py-2 font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
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
        <p className="mt-4 text-right font-display text-2xl text-ink">Subtotal {formatNgn(quote.subtotal.toString())}</p>
        {quote.notes ? <p className="mt-4 text-sm leading-6 text-ink">{quote.notes}</p> : null}
        {quote.isDemo ? (
          <p className="mt-4 text-sm text-base-content/70">Demo quotation. Sample prices are not current market prices.</p>
        ) : null}
      </article>
      <section className="mt-8 print:hidden">
        <h2 className="font-display text-2xl text-ink">History</h2>
        {history.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No history yet" description="Status changes will be listed with the person who recorded them." />
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
  if (typeof record.from === "string" && typeof record.to === "string") {
    return `${quoteStatusLabel(record.from)} to ${quoteStatusLabel(record.to)}`;
  }
  if (typeof record.quoteNumber === "string") return record.quoteNumber;
  return "";
}
