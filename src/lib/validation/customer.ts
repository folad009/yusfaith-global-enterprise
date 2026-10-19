import { z } from "zod";

export const customerTypes = ["CONTRACTOR", "RETAILER", "DEVELOPER", "WHOLESALE"] as const;
export const customerStatuses = ["ACTIVE", "INACTIVE"] as const;

export const customerSchema = z.object({
  businessName: z.string().trim().min(2, "Enter the business name.").max(160),
  contactPerson: z.string().trim().min(2, "Enter the contact person.").max(120),
  phone: z.string().trim().min(10, "Enter a phone number with at least 10 digits.").max(30),
  email: z.email("Enter a valid email address."),
  location: z.string().trim().min(2, "Enter the location.").max(240),
  customerType: z.enum(customerTypes, { error: "Select a customer type." }),
  status: z.enum(customerStatuses, { error: "Select active or inactive." }),
});

export function customerTypeLabel(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}
