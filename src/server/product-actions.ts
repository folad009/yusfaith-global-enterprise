"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { productSchema } from "@/lib/validation/product";
import { fieldErrors } from "@/lib/validation/enquiry";
import { canEditCatalogue } from "@/lib/portal/permissions";
import { assertPortalAccess } from "@/server/portal-session";

export type ProductActionResult = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string>;
};

async function actorProfile() {
  const actor = await assertPortalAccess("products");
  if (!canEditCatalogue(actor.role)) return null;
  const profile = await getDb().userProfile.findUnique({ where: { clerkUserId: actor.userId } });
  if (!profile?.active) return null;
  return profile;
}

function inputOf(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    category: String(formData.get("category") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    description: String(formData.get("description") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    sellingPrice: String(formData.get("sellingPrice") ?? ""),
    active: String(formData.get("active") ?? "true"),
  };
}

export async function saveProduct(id: string | null, formData: FormData): Promise<ProductActionResult> {
  const profile = await actorProfile();
  if (!profile) {
    return { ok: false, message: "You cannot change catalogue prices." };
  }
  const parsed = productSchema.safeParse(inputOf(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }
  const data = {
    name: parsed.data.name,
    sku: parsed.data.sku,
    slug: parsed.data.slug,
    category: parsed.data.category,
    brand: parsed.data.brand,
    description: parsed.data.description,
    imageUrl: parsed.data.imageUrl,
    unit: parsed.data.unit,
    sellingPrice: parsed.data.sellingPrice,
    currencyCode: "NGN",
    active: parsed.data.active === "true",
  };
  try {
    const db = getDb();
    const product = id
      ? await db.product.update({ where: { id }, data })
      : await db.product.create({ data: { ...data, isDemo: profile.isDemo } });
    await db.auditLog.create({
      data: {
        actorId: profile.id,
        action: id ? "UPDATE" : "CREATE",
        entityType: "Product",
        entityId: product.id,
        metadata: { sku: product.sku, active: product.active },
        isDemo: profile.isDemo,
      },
    });
    revalidatePath("/portal/products");
    revalidatePath(`/portal/products/${product.id}`);
    redirect(`/portal/products/${product.id}?notice=${id ? "updated" : "created"}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "That SKU or slug is already used." };
    }
    throw error;
  }
}

export async function createProduct(formData: FormData) {
  return saveProduct(null, formData);
}

export async function updateProduct(id: string, formData: FormData) {
  return saveProduct(id, formData);
}

export async function setProductActive(id: string, active: boolean): Promise<ProductActionResult | void> {
  const profile = await actorProfile();
  if (!profile) {
    return { ok: false, message: "You cannot change catalogue prices." };
  }
  const db = getDb();
  const product = await db.product.update({ where: { id }, data: { active } });
  await db.auditLog.create({
    data: {
      actorId: profile.id,
      action: "UPDATE",
      entityType: "Product",
      entityId: product.id,
      metadata: { active },
      isDemo: profile.isDemo,
    },
  });
  revalidatePath("/portal/products");
  revalidatePath(`/portal/products/${id}`);
  redirect(`/portal/products/${id}?notice=${active ? "activated" : "deactivated"}`);
}
