"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { quantity } from "@/server/commerce-rules";
import { stockSchema } from "@/lib/validation/stock";
import { fieldErrors } from "@/lib/validation/enquiry";
import { requireSingleBranch } from "@/server/branch";
import { canMoveStock } from "@/lib/portal/permissions";
import { assertPortalAccess } from "@/server/portal-session";

export type StockActionResult = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function recordStockMovement(formData: FormData): Promise<StockActionResult> {
  const actor = await assertPortalAccess("inventory");
  if (!canMoveStock(actor.role)) {
    return { ok: false, message: "You can view inventory, but you cannot record stock movements." };
  }
  const profile = await getDb().userProfile.findUnique({ where: { clerkUserId: actor.userId } });
  if (!profile?.active) {
    return { ok: false, message: "Your portal profile is not active, so the stock was not changed." };
  }
  const parsed = stockSchema.safeParse({
    inventoryId: String(formData.get("inventoryId") ?? ""),
    version: String(formData.get("version") ?? ""),
    kind: String(formData.get("kind") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    reference: String(formData.get("reference") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const branch = await requireSingleBranch();
  if (!branch) {
    return { ok: false, message: "Stock can only be changed when one branch is active." };
  }
  const version = new Date(parsed.data.version);
  if (Number.isNaN(version.getTime())) {
    return { ok: false, message: "Refresh this page before recording stock." };
  }
  const amount = quantity(parsed.data.quantity);
  const delta = parsed.data.kind === "DECREASE" ? amount.neg() : amount;
  const movementType = parsed.data.kind === "RECEIPT" ? "RECEIPT" : "ADJUSTMENT";

  try {
    await getDb().$transaction(async (tx) => {
      const current = await tx.inventory.findFirst({
        where: { id: parsed.data.inventoryId, warehouse: { branchId: branch.id } },
      });
      if (!current || current.updatedAt.getTime() !== version.getTime()) {
        throw new Error("CONFLICT");
      }
      const next = current.quantityOnHand.plus(delta);
      if (next.lt(0)) throw new Error("NEGATIVE");
      const updated = await tx.inventory.updateMany({
        where: { id: current.id, updatedAt: current.updatedAt },
        data: { quantityOnHand: next, updatedAt: new Date() },
      });
      if (updated.count !== 1) throw new Error("CONFLICT");
      await tx.stockMovement.create({
        data: {
          productId: current.productId,
          warehouseId: current.warehouseId,
          type: movementType,
          quantity: amount,
          reference: parsed.data.reference,
          reason: parsed.data.reason,
          createdById: profile.id,
          isDemo: profile.isDemo,
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: profile.id,
          action: "UPDATE",
          entityType: "Inventory",
          entityId: current.id,
          metadata: {
            kind: parsed.data.kind,
            quantity: amount.toString(),
            reference: parsed.data.reference,
            note: "Order creation does not change on-hand stock.",
          },
          isDemo: profile.isDemo,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return { ok: false, message: "This stock record changed while the form was open. Refresh and try again." };
    }
    if (error instanceof Error && error.message === "NEGATIVE") {
      return { ok: false, message: "This adjustment would take the on-hand quantity below zero." };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, message: "The stock movement could not be saved." };
    }
    throw error;
  }

  revalidatePath("/portal/inventory");
  revalidatePath(`/portal/inventory/${parsed.data.inventoryId}`);
  revalidatePath("/portal");
  redirect(`/portal/inventory/${parsed.data.inventoryId}?notice=${parsed.data.kind === "RECEIPT" ? "received" : "adjusted"}`);
}
