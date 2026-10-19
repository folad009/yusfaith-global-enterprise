import type { PortalRole } from "@/lib/portal/access";
import { canAccess } from "@/lib/portal/access";

/** Statuses that count as order value. Pending approval and cancelled orders are excluded. Delivered orders stay in the total. This is not paid revenue. */
export const orderValueStatuses = ["CONFIRMED", "PICKING", "READY", "DISPATCHED", "DELIVERED"] as const;

export const pendingOrderStatuses = ["CONFIRMED", "PICKING", "READY"] as const;

export const awaitingApprovalStatuses = ["DRAFT"] as const;

export const orderStatuses = [
  "DRAFT",
  "CONFIRMED",
  "PICKING",
  "READY",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type DashboardOrderStatus = (typeof orderStatuses)[number];

export function isOrderStatus(value: string): value is DashboardOrderStatus {
  return orderStatuses.some((status) => status === value);
}

export function dashboardAccess(role: PortalRole, customerId: string | null = null) {
  const wholesale = role === "wholesale_customer";
  const linked = wholesale && Boolean(customerId);
  return {
    orders: linked || (canAccess(role, "orders") && !wholesale),
    orderValue: canAccess(role, "reports"),
    products: canAccess(role, "products"),
    inventory: canAccess(role, "inventory"),
    customers: canAccess(role, "customers") && !wholesale,
    quotes: linked || (canAccess(role, "quotes") && !wholesale),
    enquiries: canAccess(role, "quotes") && !wholesale,
    wholesaleLimited: wholesale && !customerId,
  };
}

export function receivedStatuses(status: DashboardOrderStatus | null): DashboardOrderStatus[] {
  if (status) return [status];
  return orderStatuses.filter((entry) => entry !== "CANCELLED");
}
