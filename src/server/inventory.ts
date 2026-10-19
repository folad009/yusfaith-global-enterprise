import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { requireSingleBranch } from "@/server/branch";

export const inventoryPageSize = 8;

export async function listInventory(filters: { q?: string; warehouse?: string; low?: string; page?: string }) {
  const branch = await requireSingleBranch();
  if (!branch) return null;
  const db = getDb();
  const page = Math.max(1, Number(filters.page) || 1);
  const q = filters.q?.trim();
  const where: Prisma.InventoryWhereInput = {
    warehouse: { branchId: branch.id, ...(filters.warehouse ? { id: filters.warehouse } : {}) },
    ...(q
      ? {
          product: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };
  const warehouses = await db.warehouse.findMany({
    where: { branchId: branch.id },
    orderBy: { name: "asc" },
  });
  const rows = await db.inventory.findMany({
    where,
    include: { product: true, warehouse: true },
    orderBy: [{ product: { name: "asc" } }, { warehouse: { name: "asc" } }],
  });
  const visible = filters.low === "1" ? rows.filter((row) => row.quantityOnHand.lte(row.reorderLevel)) : rows;
  const start = (page - 1) * inventoryPageSize;
  return {
    branch,
    warehouses,
    rows: visible.slice(start, start + inventoryPageSize),
    total: visible.length,
    page,
    pageCount: Math.max(1, Math.ceil(visible.length / inventoryPageSize)),
  };
}

export async function getInventory(id: string) {
  const branch = await requireSingleBranch();
  if (!branch) return null;
  const row = await getDb().inventory.findFirst({
    where: { id, warehouse: { branchId: branch.id } },
    include: {
      product: true,
      warehouse: true,
    },
  });
  if (!row) return null;
  const movements = await getDb().stockMovement.findMany({
    where: { productId: row.productId, warehouseId: row.warehouseId },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { createdBy: { select: { name: true } } },
  });
  return { branch, row, movements };
}
