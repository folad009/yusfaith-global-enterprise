import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AccessState } from "@/components/portal/access-state";
import { SalesDocumentForm } from "@/components/portal/sales-document-form";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { canEditPendingOrder } from "@/lib/commerce/workflow";
import { listActiveCustomers } from "@/server/customers";
import { updateOrder } from "@/server/order-actions";
import { customerScope } from "@/lib/portal/permissions";
import { getOrder } from "@/server/orders";
import { authorizeSection } from "@/server/portal-session";
import { listCatalogueProducts } from "@/server/quotes";

export default function EditOrderPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <EditOrder {...props} />
    </Suspense>
  );
}

async function EditOrder({ params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeSection("orders");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  if (!canEditPendingOrder(access.actor.role)) {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="This role cannot edit orders" description="Pending orders can be edited by sales and operations staff before approval." />
      </div>
    );
  }
  const scope = customerScope(access.actor);
  if (scope.mode !== "all") {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="This order cannot be edited here" description="Wholesale accounts can review their own orders. Price changes stay with sales staff before approval." />
      </div>
    );
  }
  const { id } = await params;
  const result = await getOrder(id);
  if (!result) notFound();
  if (result.order.status !== "DRAFT") {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="This order is locked" description="Approved orders keep the prices stored on each line." />
      </div>
    );
  }
  const [customers, products] = await Promise.all([listActiveCustomers(), listCatalogueProducts()]);
  const order = result.order;
  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader title={`Edit ${order.orderNumber}`} description="Saving recalculates the subtotal. Approval still has to happen after the edit." />
      <div className="mt-6">
        <SalesDocumentForm
          kind="order"
          action={updateOrder.bind(null, order.id)}
          customers={customers}
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            unit: product.unit,
            price: product.sellingPrice.toString(),
          }))}
          initial={{
            customerId: order.customerId,
            date: order.orderDate.toISOString().slice(0, 10),
            notes: order.notes,
            lines: order.items.map((item) => ({
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
