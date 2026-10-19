"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { canManageQuotes } from "@/lib/commerce/workflow";
import { canReadCustomerRecord } from "@/lib/portal/permissions";
import { isQuoteWorkflowStatus, type QuoteWorkflowStatus } from "@/lib/commerce/workflow-labels";
import { fieldErrors } from "@/lib/validation/enquiry";
import { linesFromForm, quoteHeaderSchema } from "@/lib/validation/sales-document";
import { requireSingleBranch } from "@/server/branch";
import { assertQuoteTransition } from "@/server/commerce-rules";
import { priceDocumentLines } from "@/server/document-lines";
import { nextDocumentNumber, salesActor } from "@/server/sales-actor";

export type QuoteActionResult = { ok: false; message: string; fieldErrors?: Record<string, string> };

function headerOf(formData: FormData) {
  return {
    customerId: String(formData.get("customerId") ?? ""),
    expiryDate: String(formData.get("expiryDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function saveQuote(id: string | null, formData: FormData): Promise<QuoteActionResult> {
  const actor = await salesActor("quotes");
  if (!actor) return { ok: false, message: "Your portal profile is not active, so the quotation was not saved." };
  if (!canManageQuotes(actor.actor.role)) return { ok: false, message: "You cannot create or edit quotations." };
  const branch = await requireSingleBranch();
  if (!branch) return { ok: false, message: "Quotations can only be saved when one branch is active." };
  const parsed = quoteHeaderSchema.safeParse(headerOf(formData));
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const customer = await getDb().customer.findUnique({ where: { id: parsed.data.customerId } });
  if (!customer || customer.status !== "ACTIVE") {
    return { ok: false, message: "Choose an active customer." };
  }
  const priced = await priceDocumentLines(getDb(), branch.id, linesFromForm(formData));
  if (!priced.ok) return { ok: false, message: priced.message };
  const expiryDate = new Date(`${parsed.data.expiryDate}T00:00:00.000Z`);

  const quote = await getDb().$transaction(async (tx) => {
    if (id) {
      const current = await tx.quote.findFirst({ where: { id, branchId: branch.id } });
      if (!current) throw new Error("MISSING");
      if (!canReadCustomerRecord(actor.actor, current.customerId)) throw new Error("FORBIDDEN");
      if (current.status !== "DRAFT") throw new Error("LOCKED");
      await tx.quoteItem.deleteMany({ where: { quoteId: id } });
      return tx.quote.update({
        where: { id },
        data: {
          customerId: customer.id,
          expiryDate,
          notes: parsed.data.notes,
          subtotal: priced.subtotal,
          items: { create: priced.lines },
        },
      });
    }
    const quoteNumber = await nextDocumentNumber("QT", async (number) => {
      const existing = await tx.quote.findUnique({ where: { quoteNumber: number } });
      return Boolean(existing);
    });
    return tx.quote.create({
      data: {
        quoteNumber,
        customerId: customer.id,
        status: "DRAFT",
        expiryDate,
        subtotal: priced.subtotal,
        currencyCode: "NGN",
        notes: parsed.data.notes,
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
    if (quote === "LOCKED") return { ok: false, message: "Only a draft quotation can be edited." };
  if (quote === "FORBIDDEN") return { ok: false, message: "You cannot change another customer's quotation." };
  if (!quote) return { ok: false, message: "That quotation was not found." };

  await getDb().auditLog.create({
    data: {
      actorId: actor.profile.id,
      action: id ? "UPDATE" : "CREATE",
      entityType: "Quote",
      entityId: quote.id,
      metadata: { quoteNumber: quote.quoteNumber, subtotal: quote.subtotal.toString() },
      isDemo: actor.profile.isDemo,
    },
  });
  revalidatePath("/portal/quotes");
  revalidatePath(`/portal/quotes/${quote.id}`);
  redirect(`/portal/quotes/${quote.id}?notice=${id ? "updated" : "created"}`);
}

export async function createQuote(formData: FormData) {
  return saveQuote(null, formData);
}

export async function updateQuote(id: string, formData: FormData) {
  return saveQuote(id, formData);
}

export async function setQuoteStatus(id: string, status: QuoteWorkflowStatus): Promise<QuoteActionResult> {
  const actor = await salesActor("quotes");
  if (!actor) return { ok: false, message: "Your portal profile is not active, so the quotation was not changed." };
  if (!canManageQuotes(actor.actor.role) || !isQuoteWorkflowStatus(status)) {
    return { ok: false, message: "You cannot change this quotation." };
  }
  const branch = await requireSingleBranch();
  if (!branch) return { ok: false, message: "Quotations belong to the active branch." };
  try {
    await getDb().$transaction(async (tx) => {
      const current = await tx.quote.findFirst({ where: { id, branchId: branch.id } });
      if (!current) throw new Error("MISSING");
      if (!canReadCustomerRecord(actor.actor, current.customerId)) throw new Error("FORBIDDEN");
      assertQuoteTransition(current.status, status);
      const updated = await tx.quote.updateMany({
        where: { id, status: current.status },
        data: { status, updatedAt: new Date() },
      });
      if (updated.count !== 1) throw new Error("CONFLICT");
      await tx.auditLog.create({
        data: {
          actorId: actor.profile.id,
          action: "STATUS_CHANGE",
          entityType: "Quote",
          entityId: id,
          metadata: { from: current.status, to: status },
          isDemo: actor.profile.isDemo,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { ok: false, message: "You cannot change another customer's quotation." };
    }
    if (error instanceof Error && (error.message === "CONFLICT" || error.message === "MISSING")) {
      return { ok: false, message: "This quotation changed while the page was open. Refresh and try again." };
    }
    if (error instanceof Error && error.name === "CommerceRuleError") {
      return { ok: false, message: error.message };
    }
    throw error;
  }
  revalidatePath("/portal/quotes");
  revalidatePath(`/portal/quotes/${id}`);
  redirect(`/portal/quotes/${id}?notice=status`);
}
