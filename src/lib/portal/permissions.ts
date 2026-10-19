import type { PortalRole } from "@/lib/portal/access";
import { canChangeOrderStatus } from "@/lib/commerce/workflow";
import type { OrderWorkflowStatus } from "@/lib/commerce/workflow-labels";

export type AccessActor = {
  role: PortalRole;
  customerId: string | null;
};

/** Development-only escape hatch. Production ignores the demo flag even when Clerk keys are missing. */
export function allowUnauthenticatedDemo(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV !== "production" && env.PORTAL_ALLOW_DEMO_DATA === "true";
}

export function canEditCatalogue(role: PortalRole) {
  return role === "super_admin" || role === "operations_manager";
}

export function canMoveStock(role: PortalRole) {
  return role === "super_admin" || role === "warehouse_officer";
}

export function canApproveOrders(role: PortalRole) {
  return canChangeOrderStatus(role, "DRAFT", "CONFIRMED");
}

export function canEditOrderPrices(role: PortalRole) {
  return role === "super_admin" || role === "operations_manager" || role === "sales_officer";
}

export function customerScope(actor: AccessActor): { mode: "all" } | { mode: "own"; customerId: string } | { mode: "none" } {
  if (actor.role !== "wholesale_customer") return { mode: "all" };
  if (!actor.customerId) return { mode: "none" };
  return { mode: "own", customerId: actor.customerId };
}

export function canReadCustomerRecord(actor: AccessActor, customerId: string) {
  const scope = customerScope(actor);
  if (scope.mode === "all") return true;
  if (scope.mode === "none") return false;
  return scope.customerId === customerId;
}

export function canChangeFulfilment(role: PortalRole, from: OrderWorkflowStatus, to: OrderWorkflowStatus) {
  return canChangeOrderStatus(role, from, to);
}
