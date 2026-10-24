import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AccessState } from "@/components/portal/access-state";
import { SalesDocumentForm } from "@/components/portal/sales-document-form";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { canManageQuotes } from "@/lib/commerce/workflow";
import { listActiveCustomers } from "@/server/customers";
import { authorizeSection } from "@/server/portal-session";
import { updateQuote } from "@/server/quote-actions";
import { customerScope } from "@/lib/portal/permissions";
import { getQuote, listCatalogueProducts } from "@/server/quotes";

export default function EditQuotePage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <EditQuote {...props} />
    </Suspense>
  );
}

async function EditQuote({ params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeSection("quotes");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  if (!canManageQuotes(access.actor.role)) {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="Quotations are view only" description="Your role cannot edit quotations." />
      </div>
    );
  }
  const scope = customerScope(access.actor);
  if (scope.mode !== "all") {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="This quotation cannot be edited here" description="Wholesale accounts can review their own quotations. Sales staff edit drafts." />
      </div>
    );
  }
  const { id } = await params;
  const result = await getQuote(id);
  if (!result) notFound();
  if (result.quote.status !== "DRAFT") {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="This quotation is locked" description="Only a draft can be edited. Sent and accepted prices stay as they were stored." />
      </div>
    );
  }
  const [customers, products] = await Promise.all([listActiveCustomers(), listCatalogueProducts()]);
  const quote = result.quote;
  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader title={`Edit ${quote.quoteNumber}`} description="Saving recalculates every line total on the server." />
      <div className="mt-6">
        <SalesDocumentForm
          kind="quote"
          action={updateQuote.bind(null, quote.id)}
          customers={customers}
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            unit: product.unit,
            price: product.sellingPrice.toString(),
          }))}
          initial={{
            customerId: quote.customerId,
            date: quote.expiryDate.toISOString().slice(0, 10),
            notes: quote.notes,
            lines: quote.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity.toString(),
              unitPrice: item.unitPrice.toString(),
            })),
          }}
        />
      </div>
    </div>
  );
}
