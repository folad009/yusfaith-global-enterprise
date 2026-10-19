import { AccessState } from "@/components/portal/access-state";
import { SalesDocumentForm } from "@/components/portal/sales-document-form";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { canManageQuotes } from "@/lib/commerce/workflow";
import { listActiveCustomers } from "@/server/customers";
import { authorizeSection } from "@/server/portal-session";
import { createQuote } from "@/server/quote-actions";
import { listCatalogueProducts } from "@/server/quotes";

export default async function NewQuotePage() {
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
        <EmptyState title="Quotations are view only" description="Your role can open quotations, but it cannot create them." />
      </div>
    );
  }
  const [customers, products] = await Promise.all([listActiveCustomers(), listCatalogueProducts()]);
  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader title="New quotation" description="The quotation starts as a draft. A unique number is assigned when it is saved." />
      <div className="mt-6">
        {customers.length === 0 || products.length === 0 ? (
          <EmptyState title="A customer and an active product are required" description="Add an active customer and an active product before creating a quotation." />
        ) : (
          <SalesDocumentForm
            kind="quote"
            action={createQuote}
            customers={customers}
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              unit: product.unit,
              price: product.sellingPrice.toString(),
            }))}
          />
        )}
      </div>
    </div>
  );
}
