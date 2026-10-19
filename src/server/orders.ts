import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { isOrderWorkflowStatus } from "@/lib/commerce/workflow-labels";
import { requireSingleBranch } from "@/server/branch";

const pageSize = 8;

export async function listOrders(filters: { q?: string; status?: string; page?: string }, ownerCustomerId?: string) {
  const branch = await requireSingleBranch();
  if (!branch) return null;
  const page = Math.max(1, Number(filters.page) || 1);
  const q = filters.q?.trim();
  const status = filters.status?.toUpperCase() ?? "";
  const where: Prisma.OrderWhereInput = {
    branchId: branch.id,
    ...(ownerCustomerId ? { customerId: ownerCustomerId } : {}),
  };
  if (isOrderWorkflowStatus(status)) where.status = status;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customer: { businessName: { contains: q, mode: "insensitive" } } },
    ];
  }
  const db = getDb();
  const [total, rows] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      include: { customer: { select: { businessName: true } } },
      orderBy: { orderDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { branch, rows, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getOrder(id: string, ownerCustomerId?: string) {
  const branch = await requireSingleBranch();
  if (!branch) return null;
  const order = await getDb().order.findFirst({
    where: { id, branchId: branch.id, ...(ownerCustomerId ? { customerId: ownerCustomerId } : {}) },
    include: {
      customer: true,
      quote: { select: { id: true, quoteNumber: true } },
      items: { include: { product: true }, orderBy: { id: "asc" } },
      createdBy: { select: { name: true } },
    },
  });
  if (!order) return null;
  const history = await getDb().auditLog.findMany({
    where: { entityType: "Order", entityId: order.id },
    include: { actor: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return { branch, order, history };
}
