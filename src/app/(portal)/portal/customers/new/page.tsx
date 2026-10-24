import { Suspense } from "react";
import { AccessState } from "@/components/portal/access-state";
import { CustomerForm } from "@/components/portal/customer-form";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { canManageCustomers } from "@/lib/commerce/workflow";
import { authorizeSection } from "@/server/portal-session";

export default function NewCustomerPage() {
  return (
    <Suspense>
      <NewCustomer />
    </Suspense>
  );
}

async function NewCustomer() {
  const access = await authorizeSection("customers");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  if (!canManageCustomers(access.actor.role)) {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="You cannot add customers" description="Sales and operations staff create buyer profiles." />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader title="Add customer" description="Store the business, contact, and location used on quotations and orders." />
      <div className="mt-6">
        <CustomerForm />
      </div>
    </div>
  );
}
