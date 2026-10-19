import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

const pageSize = 8;

export async function listCustomers(filters: { q?: string; status?: string; page?: string }, ownerCustomerId?: string) {
  const page = Math.max(1, Number(filters.page) || 1);
  const q = filters.q?.trim();
  const where: Prisma.CustomerWhereInput = ownerCustomerId ? { id: ownerCustomerId } : {};
  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { contactPerson: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filters.status === "ACTIVE" || filters.status === "INACTIVE" || filters.status === "PENDING") {
    where.status = filters.status;
  }
  const db = getDb();
  const [total, rows] = await Promise.all([
    db.customer.count({ where }),
    db.customer.findMany({
      where,
      orderBy: { businessName: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getCustomer(id: string, ownerCustomerId?: string) {
  if (ownerCustomerId && ownerCustomerId !== id) return null;
  return getDb().customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { orderDate: "desc" },
        take: 12,
        select: { id: true, orderNumber: true, status: true, orderDate: true, subtotal: true },
      },
    },
  });
}

export async function listActiveCustomers() {
  return getDb().customer.findMany({
    where: { status: "ACTIVE" },
    orderBy: { businessName: "asc" },
    select: { id: true, businessName: true },
  });
}
