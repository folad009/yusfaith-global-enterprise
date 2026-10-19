import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@/generated/prisma/client";
import {
  assertOrderTransition,
  assertQuoteTransition,
  assertSubtotal,
  CommerceRuleError,
  lineTotal,
  quantity,
  unitPrice,
} from "./commerce-rules";
import { canChangeOrderStatus } from "@/lib/commerce/workflow";

test("line totals are quantity times unit price, rounded to kobo", () => {
  const total = lineTotal(new Prisma.Decimal("2.5"), new Prisma.Decimal("9800"));
  assert.equal(total.toFixed(2), "24500.00");
  assert.throws(() => quantity("0"), CommerceRuleError);
  assert.throws(() => unitPrice("-1"), CommerceRuleError);
});

test("a subtotal must equal the stored line totals", () => {
  const lines = [new Prisma.Decimal("420.00"), new Prisma.Decimal("9800.00")];
  assert.equal(assertSubtotal(lines, new Prisma.Decimal("10220.00")).toFixed(2), "10220.00");
  assert.throws(() => assertSubtotal(lines, new Prisma.Decimal("1.00")), CommerceRuleError);
});

test("order and quote status changes follow the allowed path", () => {
  assert.doesNotThrow(() => assertOrderTransition("DRAFT", "CONFIRMED"));
  assert.doesNotThrow(() => assertOrderTransition("DISPATCHED", "DELIVERED"));
  assert.throws(() => assertOrderTransition("DELIVERED", "CANCELLED"), /Cannot change order status/);
  assert.throws(() => assertOrderTransition("DISPATCHED", "CONFIRMED"), CommerceRuleError);
  assert.doesNotThrow(() => assertQuoteTransition("SENT", "ACCEPTED"));
  assert.throws(() => assertQuoteTransition("ACCEPTED", "DRAFT"), CommerceRuleError);
});

test("warehouse staff can fulfil an approved order and cannot approve or cancel it", () => {
  assert.equal(canChangeOrderStatus("warehouse_officer", "CONFIRMED", "PICKING"), true);
  assert.equal(canChangeOrderStatus("warehouse_officer", "DRAFT", "CONFIRMED"), false);
  assert.equal(canChangeOrderStatus("warehouse_officer", "CONFIRMED", "CANCELLED"), false);
  assert.equal(canChangeOrderStatus("sales_officer", "DRAFT", "CANCELLED"), true);
  assert.equal(canChangeOrderStatus("sales_officer", "CONFIRMED", "CANCELLED"), false);
  assert.equal(canChangeOrderStatus("operations_manager", "PICKING", "READY"), true);
});
