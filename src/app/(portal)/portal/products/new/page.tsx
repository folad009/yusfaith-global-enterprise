import { Suspense } from "react";
import { ProductForm } from "@/components/portal/product-form";
import { PortalPageHeader } from "@/components/portal/page-header";
import { AccessState } from "@/components/portal/access-state";
import { EmptyState } from "@/components/ui/empty-state";
import { canEditCatalogue } from "@/lib/portal/permissions";
import { authorizeSection } from "@/server/portal-session";

export default function NewProductPage() {
  return (
    <Suspense>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
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
  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader title="Add product" description="Prices are catalogue prices in NGN. They do not rewrite prices already stored on orders." />
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
