import { z } from "zod";

export const productCategories = [
  "HBM_CEMENT",
  "DANGOTE_CEMENT",
  "BLOCKS",
  "AGGREGATES",
  "OTHER",
] as const;

export const units = ["BAG", "PIECE", "LOAD", "TONNE"] as const;

const money = z.string().trim().refine((value) => {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return false;
  return Number(value) >= 0;
}, "Enter a price in NGN with up to two decimal places.");

export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter the product name.").max(120),
  sku: z.string().trim().min(2, "Enter a SKU.").max(40),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  category: z.enum(productCategories, { error: "Select a category." }),
  brand: z.string().trim().min(2, "Enter the brand.").max(80),
  description: z.string().trim().min(10, "Enter a description.").max(2000),
  imageUrl: z
    .string()
    .trim()
    .max(300)
    .refine(
      (value) => value.length === 0 || value.startsWith("/") || value.startsWith("https://"),
      "Use a site path or an https image address.",
    ),
  unit: z.enum(units, { error: "Select a unit." }),
  sellingPrice: money,
  active: z.enum(["true", "false"]),
});

export type ProductInput = z.infer<typeof productSchema>;

const categoryLabels: Record<(typeof productCategories)[number], string> = {
  HBM_CEMENT: "HBM Cement",
  DANGOTE_CEMENT: "Dangote Cement",
  BLOCKS: "Blocks",
  AGGREGATES: "Aggregates",
  OTHER: "Other",
};

export function categoryLabel(category: string) {
  if (category in categoryLabels) return categoryLabels[category as keyof typeof categoryLabels];
  return category;
}
