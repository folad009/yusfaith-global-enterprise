import { AccessState } from "@/components/portal/access-state";
import { SalesDocumentForm } from "@/components/portal/sales-document-form";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { canCreateOrder } from "@/lib/commerce/workflow";
import { listActiveCustomers } from "@/server/customers";
import { createOrder } from "@/server/order-actions";
import { authorizeSection } from "@/server/portal-session";
import { listCatalogueProducts } from "@/server/quotes";

export default async function NewOrderPage() {
  const access = await authorizeSection("orders");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  if (!canCreateOrder(access.actor.role)) {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="Orders are view only for this role" description="Warehouse staff can move fulfilment statuses. Sales staff record new orders." />
      </div>
    );
  }
  const [customers, products] = await Promise.all([listActiveCustomers(), listCatalogueProducts()]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader title="New order" description="The order starts as Pending until an authorised manager approves it." />
      <div className="mt-6">
        {customers.length === 0 || products.length === 0 ? (
          <EmptyState title="A customer and an active product are required" description="Add an active customer and an active product before recording an order." />
        ) : (
          <SalesDocumentForm
            kind="order"
            action={createOrder}
            customers={customers}
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              unit: product.unit,
              price: product.sellingPrice.toString(),
            }))}
            initial={{ customerId: customers[0].id, date: today, notes: "", lines: [] }}
          />
        )}
      </div>
    </div>
  );
}
