import { z } from "zod";

export const stockSchema = z.object({
  inventoryId: z.string().trim().min(1),
  version: z.string().trim().min(1),
  kind: z.enum(["RECEIPT", "INCREASE", "DECREASE"]),
  quantity: z
    .string()
    .trim()
    .refine((value) => /^\d+(\.\d{1,3})?$/.test(value) && Number(value) > 0, "Enter a quantity greater than zero."),
  reference: z.string().trim().min(2, "Enter a reference number.").max(40),
  reason: z.string().trim().min(3, "Enter the reason for this movement.").max(200),
});

export type StockInput = z.infer<typeof stockSchema>;
