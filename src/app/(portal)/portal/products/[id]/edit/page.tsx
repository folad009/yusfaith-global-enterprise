import { notFound } from "next/navigation";
import { AccessState } from "@/components/portal/access-state";
import { ProductForm } from "@/components/portal/product-form";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { canEditCatalogue } from "@/lib/portal/permissions";
import { authorizeSection } from "@/server/portal-session";
import { getProduct } from "@/server/products";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeSection("products");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  if (!canEditCatalogue(access.actor.role)) {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="Catalogue prices are view only" description="Super Admin and Operations Manager maintain selling prices. Warehouse staff do not edit them." />
      </div>
    );
  }
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader title={`Edit ${product.name}`} description="Saving updates the catalogue price only. Stock and existing orders are unchanged." />
      <div className="mt-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
