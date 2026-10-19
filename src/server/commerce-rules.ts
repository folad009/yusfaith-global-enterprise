import { Prisma } from "@/generated/prisma/client";

export const orderTransitions = {
  DRAFT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PICKING", "CANCELLED"],
  PICKING: ["READY", "CANCELLED"],
  READY: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
} as const;

export const quoteTransitions = {
  DRAFT: ["SENT", "DECLINED"],
  SENT: ["ACCEPTED", "DECLINED", "EXPIRED"],
  ACCEPTED: [],
  DECLINED: [],
  EXPIRED: [],
} as const;

export const enquiryTransitions = {
  NEW: ["REVIEWING", "CLOSED"],
  REVIEWING: ["REPLIED", "CLOSED"],
  REPLIED: ["CLOSED"],
  CLOSED: [],
} as const;

export class CommerceRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommerceRuleError";
  }
}

export function currencyCode(value: string) {
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) {
    throw new CommerceRuleError("Currency code must be three letters");
  }
  return code;
}

export function quantity(value: string | number | Prisma.Decimal) {
  const amount = new Prisma.Decimal(value);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new CommerceRuleError("Quantity must be greater than zero");
  }
  return amount.toDecimalPlaces(3);
}

export function unitPrice(value: string | number | Prisma.Decimal) {
  const amount = new Prisma.Decimal(value);
  if (!amount.isFinite() || amount.lt(0)) {
    throw new CommerceRuleError("Unit price cannot be negative");
  }
  return amount.toDecimalPlaces(2);
}

export function lineTotal(qty: Prisma.Decimal, price: Prisma.Decimal) {
  return quantity(qty).mul(unitPrice(price)).toDecimalPlaces(2);
}

export function assertLineTotal(
  qty: Prisma.Decimal,
  price: Prisma.Decimal,
  total: Prisma.Decimal,
) {
  const expected = lineTotal(qty, price);
  if (!expected.equals(total.toDecimalPlaces(2))) {
    throw new CommerceRuleError("Line total must equal quantity times unit price");
  }
  return expected;
}

export function assertSubtotal(lines: Prisma.Decimal[], subtotal: Prisma.Decimal) {
  const expected = lines.reduce((sum, line) => sum.plus(line), new Prisma.Decimal(0)).toDecimalPlaces(2);
  if (!expected.equals(subtotal.toDecimalPlaces(2))) {
    throw new CommerceRuleError("Subtotal must equal the sum of line totals");
  }
  return expected;
}

export function assertOrderTransition(from: keyof typeof orderTransitions, to: string) {
  assertTransition(orderTransitions, from, to, "order");
}

export function assertQuoteTransition(from: keyof typeof quoteTransitions, to: string) {
  assertTransition(quoteTransitions, from, to, "quote");
}

export function assertEnquiryTransition(from: keyof typeof enquiryTransitions, to: string) {
  assertTransition(enquiryTransitions, from, to, "enquiry");
}

function assertTransition(
  table: Record<string, readonly string[]>,
  from: string,
  to: string,
  label: string,
) {
  const allowed = table[from];
  if (!allowed) {
    throw new CommerceRuleError(`Unknown ${label} status ${from}`);
  }
  if (!allowed.includes(to)) {
    throw new CommerceRuleError(`Cannot change ${label} status from ${from} to ${to}`);
  }
}
