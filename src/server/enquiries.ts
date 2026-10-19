"use server";

import { getDb } from "@/lib/db";
import {
  accountSchema,
  fieldErrors,
  quoteSchema,
} from "@/lib/validation/enquiry";

export type EnquiryResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function submitQuote(input: unknown): Promise<EnquiryResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and submit the quotation request again.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    const db = getDb();
    await db.enquiry.create({
      data: {
        kind: "QUOTE",
        customerName: parsed.data.customerName,
        businessName: parsed.data.businessName,
        phone: parsed.data.phone,
        email: parsed.data.email,
        location: parsed.data.location,
        productSlug: parsed.data.productSlug,
        quantity: parsed.data.quantity,
        message: parsed.data.notes,
        notes: parsed.data.notes,
      },
    });
  } catch (error) {
    console.error("Quote enquiry failed", error);
    return {
      ok: false,
      message: "The enquiry could not be saved. Confirm the database is running, then try again.",
    };
  }

  return { ok: true };
}

export async function submitAccountApplication(input: unknown): Promise<EnquiryResult> {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and submit the application again.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    const db = getDb();
    await db.enquiry.create({
      data: {
        kind: "ACCOUNT",
        customerName: parsed.data.customerName,
        businessName: parsed.data.businessName,
        phone: parsed.data.phone,
        email: parsed.data.email,
        location: parsed.data.location,
        buyerType: parsed.data.buyerType,
        monthlyVolume: parsed.data.monthlyVolume,
        message: parsed.data.notes,
        notes: parsed.data.notes,
      },
    });
  } catch (error) {
    console.error("Account application failed", error);
    return {
      ok: false,
      message: "The application could not be saved. Confirm the database is running, then try again.",
    };
  }

  return { ok: true };
}
