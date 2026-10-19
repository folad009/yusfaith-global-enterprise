"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { canManageCustomers } from "@/lib/commerce/workflow";
import { customerSchema } from "@/lib/validation/customer";
import { fieldErrors } from "@/lib/validation/enquiry";
import { salesActor } from "@/server/sales-actor";

export type CustomerActionResult = { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function saveCustomer(id: string | null, formData: FormData): Promise<CustomerActionResult> {
  const actor = await salesActor("customers");
  if (!actor) return { ok: false, message: "Your portal profile is not active, so the customer was not saved." };
  if (!canManageCustomers(actor.actor.role)) {
    return { ok: false, message: "You cannot create or edit customers." };
  }
  const parsed = customerSchema.safeParse({
    businessName: String(formData.get("businessName") ?? ""),
    contactPerson: String(formData.get("contactPerson") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    location: String(formData.get("location") ?? ""),
    customerType: String(formData.get("customerType") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const data = {
    businessName: parsed.data.businessName,
    contactPerson: parsed.data.contactPerson,
    phone: parsed.data.phone,
    email: parsed.data.email,
    address: parsed.data.location,
    customerType: parsed.data.customerType,
    status: parsed.data.status,
  };
  try {
    const db = getDb();
    const customer = await db.$transaction(async (tx) => {
      const saved = id
        ? await tx.customer.update({ where: { id }, data })
        : await tx.customer.create({ data: { ...data, isDemo: actor.profile.isDemo } });
      await tx.auditLog.create({
        data: {
          actorId: actor.profile.id,
          action: id ? "UPDATE" : "CREATE",
          entityType: "Customer",
          entityId: saved.id,
          metadata: { status: saved.status, customerType: saved.customerType },
          isDemo: actor.profile.isDemo,
        },
      });
      return saved;
    });
    revalidatePath("/portal/customers");
    revalidatePath(`/portal/customers/${customer.id}`);
    redirect(`/portal/customers/${customer.id}?notice=${id ? "updated" : "created"}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "That email is already used by another customer." };
    }
    throw error;
  }
}

export async function createCustomer(formData: FormData) {
  return saveCustomer(null, formData);
}

export async function updateCustomer(id: string, formData: FormData) {
  return saveCustomer(id, formData);
}
