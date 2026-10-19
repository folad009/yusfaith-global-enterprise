import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { productCategories } from "@/lib/validation/product";

export const productPageSize = 8;

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  active?: string;
  page?: string;
};

export async function listProducts(filters: ProductFilters) {
  const db = getDb();
  const page = Math.max(1, Number(filters.page) || 1);
  const where: Prisma.ProductWhereInput = {};
  const q = filters.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }
  if (productCategories.some((category) => category === filters.category)) {
    where.category = filters.category as (typeof productCategories)[number];
  }
  if (filters.brand) where.brand = filters.brand;
  if (filters.active === "true") where.active = true;
  if (filters.active === "false") where.active = false;

  const [total, rows, brands] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * productPageSize,
      take: productPageSize,
    }),
    db.product.findMany({ select: { brand: true }, distinct: ["brand"], orderBy: { brand: "asc" } }),
  ]);

  return {
    rows,
    brands: brands.map((row) => row.brand),
    page,
    pageCount: Math.max(1, Math.ceil(total / productPageSize)),
    total,
  };
}

export async function getProduct(id: string) {
  return getDb().product.findUnique({ where: { id } });
}
