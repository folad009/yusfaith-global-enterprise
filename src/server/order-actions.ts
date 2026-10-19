"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { canChangeOrderStatus, canCreateOrder, canEditPendingOrder } from "@/lib/commerce/workflow";
import { canReadCustomerRecord } from "@/lib/portal/permissions";
import { isOrderWorkflowStatus, type OrderWorkflowStatus } from "@/lib/commerce/workflow-labels";
import { fieldErrors } from "@/lib/validation/enquiry";
import { linesFromForm, orderHeaderSchema } from "@/lib/validation/sales-document";
import { requireSingleBranch } from "@/server/branch";
import { assertOrderTransition, CommerceRuleError } from "@/server/commerce-rules";
import { priceDocumentLines } from "@/server/document-lines";
import { nextDocumentNumber, salesActor } from "@/server/sales-actor";

export type OrderActionResult = { ok: false; message: string; fieldErrors?: Record<string, string> };

function headerOf(formData: FormData) {
  return {
    customerId: String(formData.get("customerId") ?? ""),
    orderDate: String(formData.get("orderDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function saveOrder(id: string | null, formData: FormData): Promise<OrderActionResult> {
  const actor = await salesActor("orders");
  if (!actor) return { ok: false, message: "Your portal profile is not active, so the order was not saved." };
  if (!canCreateOrder(actor.actor.role) || (id && !canEditPendingOrder(actor.actor.role))) {
    return { ok: false, message: "You cannot create or edit orders." };
  }
  const branch = await requireSingleBranch();
  if (!branch) return { ok: false, message: "Orders can only be saved when one branch is active." };
  const parsed = orderHeaderSchema.safeParse(headerOf(formData));
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const customer = await getDb().customer.findUnique({ where: { id: parsed.data.customerId } });
  if (!customer || customer.status !== "ACTIVE") return { ok: false, message: "Choose an active customer." };
  const priced = await priceDocumentLines(getDb(), branch.id, linesFromForm(formData));
  if (!priced.ok) return { ok: false, message: priced.message };
  const orderDate = new Date(`${parsed.data.orderDate}T00:00:00.000Z`);

  const order = await getDb().$transaction(async (tx) => {
    if (id) {
      const current = await tx.order.findFirst({ where: { id, branchId: branch.id } });
      if (!current) throw new Error("MISSING");
      if (!canReadCustomerRecord(actor.actor, current.customerId)) throw new Error("FORBIDDEN");
      if (current.status !== "DRAFT") throw new Error("LOCKED");
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      return tx.order.update({
        where: { id },
        data: {
          customerId: customer.id,
          orderDate,
          notes: parsed.data.notes,
          subtotal: priced.subtotal,
          items: { create: priced.lines },
        },
      });
    }
    const orderNumber = await nextDocumentNumber("YF", async (number) => {
      const existing = await tx.order.findUnique({ where: { orderNumber: number } });
      return Boolean(existing);
    });
    return tx.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: "DRAFT",
        orderDate,
        subtotal: priced.subtotal,
        currencyCode: "NGN",
        notes: parsed.data.notes,
        createdById: actor.profile.id,
        branchId: branch.id,
        isDemo: actor.profile.isDemo,
        items: { create: priced.lines },
      },
    });
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "MISSING") return null;
    if (error instanceof Error && error.message === "LOCKED") return "LOCKED" as const;
    if (error instanceof Error && error.message === "FORBIDDEN") return "FORBIDDEN" as const;
    throw error;
  });
  if (order === "LOCKED") return { ok: false, message: "Only a pending order can be edited. Approved prices stay on the order." };
  if (order === "FORBIDDEN") return { ok: false, message: "You cannot change another customer's order." };
  if (!order) return { ok: false, message: "That order was not found." };

  await getDb().auditLog.create({
    data: {
      actorId: actor.profile.id,
      action: id ? "UPDATE" : "CREATE",
      entityType: "Order",
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, subtotal: order.subtotal.toString(), status: order.status },
      isDemo: actor.profile.isDemo,
    },
  });
  revalidatePath("/portal/orders");
  revalidatePath(`/portal/orders/${order.id}`);
  revalidatePath("/portal");
  redirect(`/portal/orders/${order.id}?notice=${id ? "updated" : "created"}`);
}

export async function createOrder(formData: FormData) {
  return saveOrder(null, formData);
}

export async function updateOrder(id: string, formData: FormData) {
  return saveOrder(id, formData);
}

export async function createOrderFromQuote(quoteId: string): Promise<OrderActionResult> {
  const actor = await salesActor("orders");
  if (!actor) return { ok: false, message: "Your portal profile is not active, so the order was not created." };
  if (!canCreateOrder(actor.actor.role)) return { ok: false, message: "You cannot create orders." };
  const branch = await requireSingleBranch();
  if (!branch) return { ok: false, message: "Orders can only be saved when one branch is active." };

  const created = await getDb().$transaction(async (tx) => {
    const quote = await tx.quote.findFirst({
      where: { id: quoteId, branchId: branch.id },
      include: { items: true, order: true, customer: true },
    });
    if (!quote) throw new Error("MISSING");
    if (!canReadCustomerRecord(actor.actor, quote.customerId)) throw new Error("FORBIDDEN");
    if (quote.status !== "ACCEPTED") throw new Error("NOT_ACCEPTED");
    if (quote.order) throw new Error("EXISTS");
    if (quote.customer.status !== "ACTIVE") throw new Error("CUSTOMER");
    const rows = quote.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
    }));
    const priced = await priceDocumentLines(tx as unknown as ReturnType<typeof getDb>, branch.id, rows);
    if (!priced.ok) throw new Error(priced.message);
    const orderNumber = await nextDocumentNumber("YF", async (number) => {
      const existing = await tx.order.findUnique({ where: { orderNumber: number } });
      return Boolean(existing);
    });
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: quote.customerId,
        status: "DRAFT",
        orderDate: new Date(),
        subtotal: priced.subtotal,
        currencyCode: "NGN",
        notes: quote.notes,
        createdById: actor.profile.id,
        branchId: branch.id,
        quoteId: quote.id,
        isDemo: actor.profile.isDemo,
        items: { create: priced.lines },
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actor.profile.id,
        action: "CREATE",
        entityType: "Order",
        entityId: order.id,
        metadata: { orderNumber, quoteNumber: quote.quoteNumber, subtotal: priced.subtotal.toString() },
        isDemo: actor.profile.isDemo,
      },
    });
    return order;
  }).catch((error: unknown) => {
    if (!(error instanceof Error)) throw error;
    if (error.message === "FORBIDDEN") return { ok: false as const, message: "You cannot use another customer's quotation." };
    if (error.message === "MISSING") return { ok: false as const, message: "That quotation was not found." };
    if (error.message === "NOT_ACCEPTED") return { ok: false as const, message: "Only an accepted quotation can become an order." };
    if (error.message === "EXISTS") return { ok: false as const, message: "This quotation already has an order." };
    if (error.message === "CUSTOMER") return { ok: false as const, message: "The customer is not active." };
    return { ok: false as const, message: error.message };
  });
  if ("ok" in created) return created;
  revalidatePath("/portal/orders");
  revalidatePath("/portal/quotes");
  revalidatePath(`/portal/quotes/${quoteId}`);
  redirect(`/portal/orders/${created.id}?notice=from-quote`);
}

export async function setOrderStatus(id: string, status: OrderWorkflowStatus, reason: string): Promise<OrderActionResult> {
  const actor = await salesActor("orders");
  if (!actor) return { ok: false, message: "Your portal profile is not active, so the order was not changed." };
  if (!isOrderWorkflowStatus(status)) return { ok: false, message: "Choose a valid status." };
  const branch = await requireSingleBranch();
  if (!branch) return { ok: false, message: "Orders belong to the active branch." };
  const cancellationReason = reason.trim();
  if (status === "CANCELLED" && cancellationReason.length < 3) {
    return { ok: false, message: "Enter a cancellation reason." };
  }
  try {
    await getDb().$transaction(async (tx) => {
      const current = await tx.order.findFirst({ where: { id, branchId: branch.id } });
      if (!current) throw new Error("MISSING");
      if (!canReadCustomerRecord(actor.actor, current.customerId)) throw new Error("FORBIDDEN");
      if (!canChangeOrderStatus(actor.actor.role, current.status, status)) throw new Error("FORBIDDEN");
      assertOrderTransition(current.status, status);
      const updated = await tx.order.updateMany({
        where: { id, status: current.status },
        data: {
          status,
          cancellationReason: status === "CANCELLED" ? cancellationReason : current.cancellationReason,
          updatedAt: new Date(),
        },
      });
      if (updated.count !== 1) throw new Error("CONFLICT");
      await tx.auditLog.create({
        data: {
          actorId: actor.profile.id,
          action: "STATUS_CHANGE",
          entityType: "Order",
          entityId: id,
          metadata: {
            from: current.status,
            to: status,
            ...(status === "CANCELLED" ? { reason: cancellationReason } : {}),
          },
          isDemo: actor.profile.isDemo,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { ok: false, message: "You are not allowed to make that status change." };
    }
    if (error instanceof Error && (error.message === "CONFLICT" || error.message === "MISSING")) {
      return { ok: false, message: "This order changed while the page was open. Refresh and try again." };
    }
    if (error instanceof CommerceRuleError) return { ok: false, message: error.message };
    throw error;
  }
  revalidatePath("/portal/orders");
  revalidatePath(`/portal/orders/${id}`);
  revalidatePath("/portal");
  redirect(`/portal/orders/${id}?notice=status`);
}
