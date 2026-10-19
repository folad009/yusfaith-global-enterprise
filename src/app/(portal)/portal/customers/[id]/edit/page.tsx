import { notFound } from "next/navigation";
import { AccessState } from "@/components/portal/access-state";
import { CustomerForm } from "@/components/portal/customer-form";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { canManageCustomers } from "@/lib/commerce/workflow";
import { customerScope } from "@/lib/portal/permissions";
import { getCustomer } from "@/server/customers";
import { authorizeSection } from "@/server/portal-session";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeSection("customers");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }
  if (!canManageCustomers(access.actor.role) || customerScope(access.actor).mode !== "all") {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState title="Customer profiles are view only" description="Sales and operations staff edit buyer profiles. A wholesale account can open only its own record." />
      </div>
    );
  }
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();
  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader title={`Edit ${customer.businessName}`} description="Past orders keep the customer details they already show." />
      <div className="mt-6">
        <CustomerForm customer={customer} />
      </div>
    </div>
  );
}
