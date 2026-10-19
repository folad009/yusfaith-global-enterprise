import type { PortalRole } from "@/lib/portal/access";
import { orderTransitions, quoteTransitions } from "@/server/commerce-rules";
import {
  type OrderWorkflowStatus,
  type QuoteWorkflowStatus,
} from "@/lib/commerce/workflow-labels";

const commercial: PortalRole[] = ["super_admin", "operations_manager", "sales_officer"];
const approvers: PortalRole[] = ["super_admin", "operations_manager"];
const fulfillment: PortalRole[] = ["super_admin", "operations_manager", "warehouse_officer"];

export function canManageCustomers(role: PortalRole) {
  return commercial.includes(role);
}

export function canManageQuotes(role: PortalRole) {
  return commercial.includes(role);
}

export function canCreateOrder(role: PortalRole) {
  return commercial.includes(role);
}

export function canEditPendingOrder(role: PortalRole) {
  return commercial.includes(role);
}

export function allowedOrderMoves(role: PortalRole, from: OrderWorkflowStatus) {
  return orderTransitions[from].filter((to) => canChangeOrderStatus(role, from, to));
}

export function canChangeOrderStatus(role: PortalRole, from: OrderWorkflowStatus, to: string) {
  const allowed = orderTransitions[from] as readonly string[];
  if (!allowed.includes(to)) return false;
  if (to === "CONFIRMED") return approvers.includes(role);
  if (to === "CANCELLED") {
    if (from === "DRAFT") return commercial.includes(role);
    return approvers.includes(role);
  }
  return fulfillment.includes(role);
}

export function allowedQuoteMoves(from: QuoteWorkflowStatus) {
  return quoteTransitions[from];
}
