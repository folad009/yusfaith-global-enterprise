import { Prisma } from "@/generated/prisma/client";
import {
  awaitingApprovalStatuses,
  dashboardAccess,
  isOrderStatus,
  orderValueStatuses,
  pendingOrderStatuses,
  receivedStatuses,
  type DashboardOrderStatus,
} from "@/lib/commerce/dashboard-rules";
import type { PortalRole } from "@/lib/portal/access";
import { allowDemoDashboard } from "@/lib/portal/demo";
import { isClerkConfigured } from "@/lib/portal/clerk";
import { getDb } from "@/lib/db";
import { authorizeSection, type AccessResult } from "@/server/portal-session";

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  href: string;
};

export type DashboardData = {
  demo: boolean;
  branchName: string;
  from: string;
  to: string;
  status: DashboardOrderStatus | null;
  metrics: DashboardMetric[];
  trend: Array<{ date: string; value: number }>;
  statusCounts: Array<{ status: string; count: number }>;
  topProducts: Array<{ name: string; quantity: number }>;
  recentOrders: Array<{
    id: string;
    number: string;
    customer: string;
    status: string;
    orderDate: string;
    value: string;
  }>;
  lowStock: Array<{ id: string; product: string; warehouse: string; onHand: string; reorder: string; unit: string }> | null;
  quotes: Array<{ id: string; number: string; customer: string; status: string; value: string }> | null;
  enquiries: Array<{ id: string; business: string; kind: string; status: string; createdAt: string }> | null;
  showOrders: boolean;
  notice: string | null;
};

export type DashboardResult =
  | { kind: "ready"; data: DashboardData }
  | { kind: "denied"; access: Exclude<AccessResult, { status: "ok" }> }
  | { kind: "no-branch" };

const day = 24 * 60 * 60 * 1000;

export function defaultDashboardRange(now = new Date()) {
  const to = now.toISOString().slice(0, 10);
  return { from: `${to.slice(0, 8)}01`, to };
}

export function parseDashboardFilters(input: { from?: string; to?: string; status?: string }) {
  const parsedFrom = parseDay(input.from);
  const parsedTo = parseDay(input.to);
  const fallback = parsedFrom && parsedTo ? null : defaultDashboardRange();
  const from = parsedFrom ?? fallback?.from ?? "";
  const to = parsedTo ?? fallback?.to ?? "";
  const ordered = from <= to ? { from, to } : { from: to, to: from };
  const span = (utcDay(ordered.to).getTime() - utcDay(ordered.from).getTime()) / day;
  const range = span > 366 ? defaultDashboardRange() : ordered;
  const status = input.status && isOrderStatus(input.status) ? input.status : null;
  return { ...range, status };
}

export async function getDashboard(filters: {
  from?: string;
  to?: string;
  status?: string;
}): Promise<DashboardResult> {
  const access = await authorizeSection("dashboard");
  const parsed = parseDashboardFilters(filters);
  if (access.status === "ok") {
    const data = await loadDashboard({
      role: access.actor.role,
      customerId: access.actor.customerId,
      demo: allowDemoDashboard() && !isClerkConfigured(),
      ...parsed,
    });
    return data ? { kind: "ready", data } : { kind: "no-branch" };
  }
  return { kind: "denied", access };
}

export async function loadDashboard(input: {
  role: PortalRole;
  customerId: string | null;
  demo: boolean;
  from: string;
  to: string;
  status: DashboardOrderStatus | null;
}): Promise<DashboardData | null> {
  const db = getDb();
  const branches = await db.branch.findMany({
    where: { active: true },
    orderBy: { code: "asc" },
    select: { id: true, name: true },
  });
  if (branches.length !== 1) return null;
  const branch = branches[0];
  const scope = dashboardAccess(input.role, input.customerId);
  const owned = input.customerId ? { customerId: input.customerId } : {};
  const from = utcDay(input.from);
  const toExclusive = new Date(utcDay(input.to).getTime() + day);
  const period = { gte: from, lt: toExclusive };
  const notice = scope.wholesaleLimited
    ? "This wholesale sign-in is not linked to a customer record, so yard-wide orders, customers, and values are withheld."
    : null;

  const grouped = scope.orders
    ? await db.order.groupBy({
        by: ["status"],
        where: { branchId: branch.id, orderDate: period, ...owned },
        _count: { _all: true },
        _sum: { subtotal: true },
      })
    : [];

  const received = new Set(receivedStatuses(input.status));
  const ordersReceived = grouped
    .filter((row) => received.has(row.status))
    .reduce((sum, row) => sum + row._count._all, 0);
  const pending = grouped
    .filter((row) => pendingOrderStatuses.some((status) => status === row.status))
    .reduce((sum, row) => sum + row._count._all, 0);
  const awaiting = grouped
    .filter((row) => awaitingApprovalStatuses.some((status) => status === row.status))
    .reduce((sum, row) => sum + row._count._all, 0);

  const valueStatuses = input.status
    ? orderValueStatuses.filter((status) => status === input.status)
    : [...orderValueStatuses];
  const orderValue = grouped
    .filter((row) => valueStatuses.some((status) => status === row.status))
    .reduce((sum, row) => sum.plus(row._sum.subtotal ?? 0), new Prisma.Decimal(0));

  const metrics: DashboardMetric[] = [];
  if (scope.orders) {
    metrics.push(
      {
        label: "Orders received",
        value: String(ordersReceived),
        detail: input.status
          ? `Order date in range, status ${label(input.status)}.`
          : "Order date in range, excluding cancelled.",
        href: input.status ? `/portal/orders?status=${input.status}` : "/portal/orders",
      },
      {
        label: "In progress",
        value: String(pending),
        detail: "Approved, processing, or ready for dispatch. Not changed by the status filter.",
        href: "/portal/orders",
      },
      {
        label: "Pending approval",
        value: String(awaiting),
        detail: "Orders waiting for an authorised approval.",
        href: "/portal/orders?status=DRAFT",
      },
    );
  }
  if (scope.customers) {
    const customers = await db.customer.count({ where: { status: "ACTIVE" } });
    metrics.push({
      label: "Active customers",
      value: String(customers),
      detail: "Buyer accounts with status Active. This is not a payment balance.",
      href: "/portal/customers",
    });
  }
  if (scope.products) {
    const products = await db.product.count({ where: { active: true } });
    metrics.push({
      label: "Catalogue products",
      value: String(products),
      detail: "Active products. Current catalogue, not limited to the date range.",
      href: "/portal/products",
    });
  }
  if (scope.inventory) {
    const low = await lowStockCount(branch.id);
    metrics.push({
      label: "Low stock",
      value: String(low),
      detail: "Products with on-hand quantity at or below the reorder level in this branch.",
      href: "/portal/inventory",
    });
  }
  if (scope.orderValue) {
    metrics.push({
      label: "Order value",
      value: formatNgn(orderValue),
      detail: valueStatuses.length
        ? "Sum of order subtotals from approved through delivered. Pending approval and cancelled orders are excluded. Not paid revenue."
        : "The selected status is outside order value, so the total is zero.",
      href: "/portal/reports",
    });
  }

  const trendOrders = scope.orderValue
    ? await db.order.findMany({
        where: { branchId: branch.id, orderDate: period, status: { in: valueStatuses }, ...owned },
        select: { orderDate: true, subtotal: true },
        orderBy: { orderDate: "asc" },
      })
    : [];
  const trendMap = new Map<string, Prisma.Decimal>();
  for (const order of trendOrders) {
    const key = order.orderDate.toISOString().slice(0, 10);
    trendMap.set(key, (trendMap.get(key) ?? new Prisma.Decimal(0)).plus(order.subtotal));
  }
  const trend = [...trendMap.entries()].map(([date, value]) => ({
    date: date.slice(5),
    value: Number(value.toFixed(2)),
  }));

  const statusCounts = scope.orders
    ? grouped
        .filter((row) => (input.status ? row.status === input.status : true))
        .map((row) => ({ status: label(row.status), count: row._count._all }))
    : [];

  const topRows = scope.orders
    ? await db.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            branchId: branch.id,
            orderDate: period,
            status: { in: [...received] },
            ...owned,
          },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      })
    : [];
  const productNames = topRows.length
    ? await db.product.findMany({
        where: { id: { in: topRows.map((row) => row.productId) } },
        select: { id: true, name: true },
      })
    : [];
  const names = new Map(productNames.map((product) => [product.id, product.name]));
  const topProducts = topRows.map((row) => ({
    name: names.get(row.productId) ?? "Product",
    quantity: Number((row._sum.quantity ?? new Prisma.Decimal(0)).toFixed(3)),
  }));

  const recent = scope.orders
    ? await db.order.findMany({
        where: {
          branchId: branch.id,
          orderDate: period,
          status: { in: [...received] },
          ...owned,
        },
        orderBy: [{ orderDate: "desc" }, { orderNumber: "desc" }],
        take: 8,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          orderDate: true,
          subtotal: true,
          customer: { select: { businessName: true } },
        },
      })
    : [];

  const lowStock = scope.inventory ? await lowStockRows(branch.id) : null;
  const quotes = scope.quotes
    ? await db.quote.findMany({
        where: { branchId: branch.id, createdAt: period, ...owned },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          quoteNumber: true,
          status: true,
          subtotal: true,
          customer: { select: { businessName: true } },
        },
      })
    : null;
  const enquiries = scope.enquiries
    ? await db.enquiry.findMany({
        where: { createdAt: period },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, businessName: true, kind: true, status: true, createdAt: true },
      })
    : null;

  return {
    demo: input.demo,
    branchName: branch.name,
    from: input.from,
    to: input.to,
    status: input.status,
    metrics,
    trend,
    statusCounts,
    topProducts,
    recentOrders: recent.map((order) => ({
      id: order.id,
      number: order.orderNumber,
      customer: order.customer.businessName,
      status: order.status,
      orderDate: order.orderDate.toISOString().slice(0, 10),
      value: formatNgn(order.subtotal),
    })),
    lowStock,
    quotes: quotes
      ? quotes.map((quote) => ({
          id: quote.id,
          number: quote.quoteNumber,
          customer: quote.customer.businessName,
          status: quote.status,
          value: formatNgn(quote.subtotal),
        }))
      : null,
    enquiries: enquiries
      ? enquiries.map((enquiry) => ({
          id: enquiry.id,
          business: enquiry.businessName,
          kind: enquiry.kind,
          status: enquiry.status,
          createdAt: enquiry.createdAt.toISOString().slice(0, 10),
        }))
      : null,
    showOrders: scope.orders,
    notice,
  };
}

function label(status: string) {
  const names: Record<string, string> = {
    DRAFT: "Pending",
    CONFIRMED: "Approved",
    PICKING: "Processing",
    READY: "Ready for Dispatch",
    DISPATCHED: "Dispatched",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return names[status] ?? status;
}

function utcDay(iso: string) {
  const [year, month, dayOfMonth] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, dayOfMonth));
}

function parseDay(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = utcDay(value);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return value;
}

function formatNgn(value: Prisma.Decimal | number | string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(new Prisma.Decimal(value).toFixed(2)));
}

async function lowStockCount(branchId: string) {
  const db = getDb();
  const rows = await db.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(DISTINCT i."productId")::int AS count
    FROM "Inventory" i
    INNER JOIN "Warehouse" w ON w.id = i."warehouseId"
    WHERE w."branchId" = ${branchId}
      AND i."quantityOnHand" <= i."reorderLevel"
  `;
  return Number(rows[0]?.count ?? 0);
}

async function lowStockRows(branchId: string) {
  const db = getDb();
  return db.$queryRaw<
    Array<{ id: string; product: string; warehouse: string; onHand: string; reorder: string; unit: string }>
  >`
    SELECT i.id,
           p.name AS product,
           w.name AS warehouse,
           i."quantityOnHand"::text AS "onHand",
           i."reorderLevel"::text AS reorder,
           p.unit::text AS unit
    FROM "Inventory" i
    INNER JOIN "Warehouse" w ON w.id = i."warehouseId"
    INNER JOIN "Product" p ON p.id = i."productId"
    WHERE w."branchId" = ${branchId}
      AND i."quantityOnHand" <= i."reorderLevel"
    ORDER BY p.name ASC
    LIMIT 8
  `;
}
