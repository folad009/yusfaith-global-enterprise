import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { isQuoteWorkflowStatus } from "@/lib/commerce/workflow-labels";
import { requireSingleBranch } from "@/server/branch";

const pageSize = 8;

export async function listQuotes(filters: { q?: string; status?: string; page?: string }, ownerCustomerId?: string) {
  const branch = await requireSingleBranch();
  if (!branch) return null;
  const page = Math.max(1, Number(filters.page) || 1);
  const q = filters.q?.trim();
  const status = filters.status?.toUpperCase() ?? "";
  const where: Prisma.QuoteWhereInput = {
    branchId: branch.id,
    ...(ownerCustomerId ? { customerId: ownerCustomerId } : {}),
  };
  if (isQuoteWorkflowStatus(status)) where.status = status;
  if (q) {
    where.OR = [
      { quoteNumber: { contains: q, mode: "insensitive" } },
      { customer: { businessName: { contains: q, mode: "insensitive" } } },
    ];
  }
  const db = getDb();
  const [total, rows] = await Promise.all([
    db.quote.count({ where }),
    db.quote.findMany({
      where,
      include: { customer: { select: { businessName: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { branch, rows, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getQuote(id: string, ownerCustomerId?: string) {
  const branch = await requireSingleBranch();
  if (!branch) return null;
  const quote = await getDb().quote.findFirst({
    where: { id, branchId: branch.id, ...(ownerCustomerId ? { customerId: ownerCustomerId } : {}) },
    include: {
      customer: true,
      items: { include: { product: true }, orderBy: { id: "asc" } },
      order: { select: { id: true, orderNumber: true } },
    },
  });
  if (!quote) return null;
  const history = await getDb().auditLog.findMany({
    where: { entityType: "Quote", entityId: quote.id },
    include: { actor: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return { branch, quote, history };
}

export async function listCatalogueProducts() {
  return getDb().product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, sku: true, unit: true, sellingPrice: true },
  });
}
