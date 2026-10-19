import { z } from "zod";

const quantityField = z
  .string()
  .trim()
  .refine((value) => /^\d+(\.\d{1,3})?$/.test(value) && Number(value) > 0, "Enter a quantity greater than zero.");

const priceField = z
  .string()
  .trim()
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), "Enter a unit price with up to two decimal places.");

export const documentLineSchema = z.object({
  productId: z.string().trim().min(1, "Select a product."),
  quantity: quantityField,
  unitPrice: priceField,
});

export const documentLinesSchema = z
  .array(documentLineSchema)
  .min(1, "Add at least one product.")
  .max(20, "A document can hold up to 20 lines.");

export const quoteHeaderSchema = z.object({
  customerId: z.string().trim().min(1, "Select a customer."),
  expiryDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter an expiry date."),
  notes: z.string().trim().max(800),
});

export const orderHeaderSchema = z.object({
  customerId: z.string().trim().min(1, "Select a customer."),
  orderDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter an order date."),
  notes: z.string().trim().max(800),
});

export function linesFromForm(formData: FormData) {
  const productIds = formData.getAll("productId").map(String);
  const quantities = formData.getAll("quantity").map(String);
  const unitPrices = formData.getAll("unitPrice").map(String);
  const count = Math.max(productIds.length, quantities.length, unitPrices.length);
  return Array.from({ length: count }, (_, index) => ({
    productId: productIds[index] ?? "",
    quantity: quantities[index] ?? "",
    unitPrice: unitPrices[index] ?? "",
  })).filter((line) => line.productId || line.quantity || line.unitPrice);
}
