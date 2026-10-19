import { Prisma } from "@/generated/prisma/client";
import type { getDb } from "@/lib/db";
import { documentLinesSchema } from "@/lib/validation/sales-document";
import { lineTotal, quantity, unitPrice } from "@/server/commerce-rules";

type Db = ReturnType<typeof getDb>;

export async function priceDocumentLines(
  db: Db,
  branchId: string,
  rows: Array<{ productId: string; quantity: string; unitPrice: string }>,
) {
  const parsed = documentLinesSchema.safeParse(rows);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Check the product lines." };
  }
  const ids = parsed.data.map((line) => line.productId);
  if (new Set(ids).size !== ids.length) {
    return { ok: false as const, message: "Each product can appear once on a document." };
  }
  const products = await db.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((product) => [product.id, product]));
  const lines = [];
  for (const row of parsed.data) {
    const product = byId.get(row.productId);
    if (!product || !product.active) {
      return { ok: false as const, message: "Each line needs an active catalogue product." };
    }
    const qty = quantity(row.quantity);
    const price = unitPrice(row.unitPrice);
    const stock = await db.inventory.aggregate({
      where: { productId: product.id, warehouse: { branchId } },
      _sum: { quantityOnHand: true },
    });
    const onHand = stock._sum.quantityOnHand ?? new Prisma.Decimal(0);
    if (qty.gt(onHand)) {
      return {
        ok: false as const,
        message: `${product.name} has ${onHand.toString()} on hand in this branch. The quantity was not saved, and stock was not reserved.`,
      };
    }
    lines.push({
      productId: product.id,
      quantity: qty,
      unitPrice: price,
      lineTotal: lineTotal(qty, price),
    });
  }
  const subtotal = lines.reduce((sum, line) => sum.plus(line.lineTotal), new Prisma.Decimal(0)).toDecimalPlaces(2);
  return { ok: true as const, lines, subtotal };
}
