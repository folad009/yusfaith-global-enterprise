import assert from "node:assert/strict";
import test from "node:test";
import { canAccess, navForRole } from "./access";
import { canChangeOrderStatus } from "../commerce/workflow";
import {
  allowUnauthenticatedDemo,
  canApproveOrders,
  canEditCatalogue,
  canEditOrderPrices,
  canMoveStock,
  canReadCustomerRecord,
  customerScope,
} from "./permissions";

const own = "customer-own";
const other = "customer-other";

test("production never enables the unauthenticated demo bypass", () => {
  assert.equal(
    allowUnauthenticatedDemo({ NODE_ENV: "production", PORTAL_ALLOW_DEMO_DATA: "true" }),
    false,
  );
  assert.equal(
    allowUnauthenticatedDemo({ NODE_ENV: "development", PORTAL_ALLOW_DEMO_DATA: "true" }),
    true,
  );
  assert.equal(
    allowUnauthenticatedDemo({ NODE_ENV: "development", PORTAL_ALLOW_DEMO_DATA: "" }),
    false,
  );
});

test("a wholesale customer can read only the linked customer", () => {
  const linked = { role: "wholesale_customer" as const, customerId: own };
  assert.equal(canReadCustomerRecord(linked, own), true);
  assert.equal(canReadCustomerRecord(linked, other), false);
  assert.deepEqual(customerScope(linked), { mode: "own", customerId: own });
  assert.deepEqual(customerScope({ role: "wholesale_customer", customerId: null }), { mode: "none" });
  assert.equal(canReadCustomerRecord({ role: "sales_officer", customerId: null }, other), true);
});

test("warehouse staff cannot approve orders or edit prices", () => {
  assert.equal(canApproveOrders("warehouse_officer"), false);
  assert.equal(canEditCatalogue("warehouse_officer"), false);
  assert.equal(canEditOrderPrices("warehouse_officer"), false);
  assert.equal(canChangeOrderStatus("warehouse_officer", "DRAFT", "CONFIRMED"), false);
  assert.equal(canChangeOrderStatus("warehouse_officer", "CONFIRMED", "PICKING"), true);
  assert.equal(canMoveStock("warehouse_officer"), true);
});

test("sales staff can create priced orders but cannot approve or move stock", () => {
  assert.equal(canEditOrderPrices("sales_officer"), true);
  assert.equal(canApproveOrders("sales_officer"), false);
  assert.equal(canMoveStock("sales_officer"), false);
  assert.equal(canEditCatalogue("sales_officer"), false);
});

test("navigation follows the role and hides sections a role cannot open", () => {
  assert.equal(canAccess("wholesale_customer", "inventory"), false);
  assert.equal(canAccess("wholesale_customer", "reports"), false);
  assert.equal(canAccess("sales_officer", "reports"), false);
  assert.equal(canAccess("sales_officer", "inventory"), false);
  assert.equal(canAccess("warehouse_officer", "quotes"), false);
  assert.equal(canAccess("operations_manager", "settings"), false);
  assert.equal(canAccess("super_admin", "settings"), true);
  assert.deepEqual(
    navForRole("warehouse_officer").map((item) => item.section),
    ["dashboard", "orders", "products", "inventory"],
  );
  assert.equal(navForRole(null).length, 0);
});

test("operations managers can approve and see inventory, and only warehouse or super admin move stock", () => {
  assert.equal(canApproveOrders("operations_manager"), true);
  assert.equal(canMoveStock("operations_manager"), false);
  assert.equal(canMoveStock("super_admin"), true);
  assert.equal(canEditCatalogue("super_admin"), true);
  assert.equal(canEditCatalogue("operations_manager"), true);
});
