import { z } from "zod";
import { products } from "@/lib/catalog";

const productSlugs = products.map((product) => product.slug);

const phone = z.string().trim().min(10, "Enter a phone number with at least 10 digits.");
const email = z.email("Enter a valid email address.");
const notes = z.string().trim().max(800, "Keep notes under 800 characters.");

export const quoteSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your name."),
  businessName: z.string().trim().min(2, "Enter the business name."),
  phone,
  email,
  location: z.string().trim().min(2, "Enter a town or area."),
  productSlug: z.string().refine((value) => productSlugs.includes(value), "Select a product."),
  quantity: z.string().trim().min(1, "Enter a quantity."),
  notes,
});

export const accountSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your name."),
  businessName: z.string().trim().min(2, "Enter the business name."),
  phone,
  email,
  location: z.string().trim().min(2, "Enter a town or area."),
  buyerType: z.enum(["contractor", "retailer", "developer", "wholesale"], {
    error: "Select a buyer type.",
  }),
  monthlyVolume: z.string().trim().min(1, "Enter an approximate monthly volume."),
  notes,
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type AccountInput = z.infer<typeof accountSchema>;

export function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}
