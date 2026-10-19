import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import {
  assertLineTotal,
  assertOrderTransition,
  assertQuoteTransition,
  assertSubtotal,
  CommerceRuleError,
  currencyCode,
  lineTotal,
  quantity,
  unitPrice,
} from "../src/server/commerce-rules";

const DEMO_NOTE =
  "Demo record for the YUSFAITH proof of concept. Sample prices are illustrative and are not current market prices.";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type Unit = "BAG" | "PIECE" | "LOAD" | "TONNE";
type Category = "HBM_CEMENT" | "DANGOTE_CEMENT" | "BLOCKS" | "AGGREGATES" | "OTHER";

const catalogue: Array<{
  sku: string;
  slug: string;
  name: string;
  category: Category;
  brand: string;
  unit: Unit;
  price: string;
  imageUrl: string;
  reorder: string;
}> = [
  {
    sku: "DEMO-HBM-50",
    slug: "hbm-cement-50kg",
    name: "HBM Cement 50kg",
    category: "HBM_CEMENT",
    brand: "HBM",
    unit: "BAG",
    price: "9800.00",
    imageUrl: "/images/hero-yard.jpg",
    reorder: "200",
  },
  {
    sku: "DEMO-DNG-50",
    slug: "dangote-cement-50kg",
    name: "Dangote Cement 50kg",
    category: "DANGOTE_CEMENT",
    brand: "Dangote Cement",
    unit: "BAG",
    price: "10200.00",
    imageUrl: "/images/warehouse-aisle.jpg",
    reorder: "200",
  },
  {
    sku: "DEMO-BLK-9",
    slug: "nine-inch-blocks",
    name: "9-inch solid blocks",
    category: "BLOCKS",
    brand: "Yard stock",
    unit: "PIECE",
    price: "550.00",
    imageUrl: "/images/blocks.jpg",
    reorder: "500",
  },
  {
    sku: "DEMO-BLK-6",
    slug: "six-inch-blocks",
    name: "6-inch solid blocks",
    category: "BLOCKS",
    brand: "Yard stock",
    unit: "PIECE",
    price: "420.00",
    imageUrl: "/images/blocks.jpg",
    reorder: "400",
  },
  {
    sku: "DEMO-BLK-H9",
    slug: "nine-inch-hollow-blocks",
    name: "9-inch hollow blocks",
    category: "BLOCKS",
    brand: "Yard stock",
    unit: "PIECE",
    price: "480.00",
    imageUrl: "/images/blocks.jpg",
    reorder: "400",
  },
  {
    sku: "DEMO-SND-SH",
    slug: "sharp-sand",
    name: "Sharp sand",
    category: "AGGREGATES",
    brand: "Yard stock",
    unit: "LOAD",
    price: "85000.00",
    imageUrl: "/images/aggregates.jpg",
    reorder: "2",
  },
  {
    sku: "DEMO-SND-PL",
    slug: "plaster-sand",
    name: "Plaster sand",
    category: "AGGREGATES",
    brand: "Yard stock",
    unit: "LOAD",
    price: "80000.00",
    imageUrl: "/images/aggregates.jpg",
    reorder: "2",
  },
  {
    sku: "DEMO-GRN",
    slug: "granite",
    name: "Granite chippings",
    category: "AGGREGATES",
    brand: "Yard stock",
    unit: "LOAD",
    price: "120000.00",
    imageUrl: "/images/aggregates.jpg",
    reorder: "2",
  },
  {
    sku: "DEMO-LAT",
    slug: "laterite-fill",
    name: "Laterite fill",
    category: "AGGREGATES",
    brand: "Yard stock",
    unit: "LOAD",
    price: "45000.00",
    imageUrl: "/images/aggregates.jpg",
    reorder: "1",
  },
  {
    sku: "DEMO-WIRE",
    slug: "binding-wire-roll",
    name: "Binding wire roll",
    category: "OTHER",
    brand: "Yard stock",
    unit: "PIECE",
    price: "3500.00",
    imageUrl: "/images/warehouse-aisle.jpg",
    reorder: "20",
  },
];

const buyers: Array<{
  email: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  customerType: "CONTRACTOR" | "RETAILER" | "DEVELOPER" | "WHOLESALE";
}> = [
  { email: "demo-buyer-01@example.invalid", businessName: "Demo — Adebola Sites", contactPerson: "Demo Contact 01", phone: "08010000001", customerType: "CONTRACTOR" },
  { email: "demo-buyer-02@example.invalid", businessName: "Demo — Mainland Block Mart", contactPerson: "Demo Contact 02", phone: "08010000002", customerType: "RETAILER" },
  { email: "demo-buyer-03@example.invalid", businessName: "Demo — Okoye Developments", contactPerson: "Demo Contact 03", phone: "08010000003", customerType: "DEVELOPER" },
  { email: "demo-buyer-04@example.invalid", businessName: "Demo — Harbour Retail", contactPerson: "Demo Contact 04", phone: "08010000004", customerType: "RETAILER" },
  { email: "demo-buyer-05@example.invalid", businessName: "Demo — Ikeja Contractors", contactPerson: "Demo Contact 05", phone: "08010000005", customerType: "CONTRACTOR" },
  { email: "demo-buyer-06@example.invalid", businessName: "Demo — Lekki Frame", contactPerson: "Demo Contact 06", phone: "08010000006", customerType: "DEVELOPER" },
  { email: "demo-buyer-07@example.invalid", businessName: "Demo — Surulere Builders", contactPerson: "Demo Contact 07", phone: "08010000007", customerType: "CONTRACTOR" },
  { email: "demo-buyer-08@example.invalid", businessName: "Demo — Northgate Homes", contactPerson: "Demo Contact 08", phone: "08010000008", customerType: "WHOLESALE" },
  { email: "demo-buyer-09@example.invalid", businessName: "Demo — Yaba Materials", contactPerson: "Demo Contact 09", phone: "08010000009", customerType: "WHOLESALE" },
  { email: "demo-buyer-10@example.invalid", businessName: "Demo — Ajah Site Stores", contactPerson: "Demo Contact 10", phone: "08010000010", customerType: "RETAILER" },
];

const orderStatuses = ["DRAFT", "CONFIRMED", "PICKING", "READY", "DISPATCHED", "CANCELLED"] as const;
const quoteStatuses = ["DRAFT", "SENT", "ACCEPTED", "DECLINED", "EXPIRED", "SENT"] as const;

function qtyFor(unit: Unit, index: number) {
  if (unit === "LOAD") return String(1 + (index % 3));
  if (unit === "PIECE") return String(200 + index * 25);
  if (unit === "TONNE") return String(2 + (index % 4));
  return String(40 + index * 10);
}

function pricedLine(price: string, qty: string, historical: boolean) {
  const parsedQty = quantity(qty);
  const parsedPrice = unitPrice(historical ? new Prisma.Decimal(price).minus(150) : price);
  const total = lineTotal(parsedQty, parsedPrice);
  assertLineTotal(parsedQty, parsedPrice, total);
  return { quantity: parsedQty, unitPrice: parsedPrice, lineTotal: total };
}

function assertRules() {
  assertOrderTransition("CONFIRMED", "PICKING");
  assertOrderTransition("DISPATCHED", "DELIVERED");
  assertQuoteTransition("SENT", "ACCEPTED");
  let rejected = false;
  try {
    assertOrderTransition("DISPATCHED", "PICKING");
  } catch (error) {
    rejected = error instanceof CommerceRuleError;
  }
  if (!rejected) {
    throw new Error("Dispatched orders must not move back to picking");
  }
  currencyCode("NGN");
}

async function main() {
  assertRules();
  const currency = currencyCode("NGN");

  await db.$transaction(async (tx) => {
    const branch = await tx.branch.upsert({
      where: { code: "LOS-01" },
      create: {
        name: "Lagos Yard",
        code: "LOS-01",
        address: "Yard address to be confirmed by the company. Demo record for the single proof-of-concept location.",
        active: true,
        isDemo: true,
      },
      update: {
        name: "Lagos Yard",
        address: "Yard address to be confirmed by the company. Demo record for the single proof-of-concept location.",
        active: true,
        isDemo: true,
      },
    });

    const mainStore = await tx.warehouse.upsert({
      where: { branchId_name: { branchId: branch.id, name: "Main store" } },
      create: {
        name: "Main store",
        location: "Covered bay inside the Lagos yard. Demo location.",
        branchId: branch.id,
        isDemo: true,
      },
      update: { location: "Covered bay inside the Lagos yard. Demo location.", isDemo: true },
    });

    const dispatchBay = await tx.warehouse.upsert({
      where: { branchId_name: { branchId: branch.id, name: "Dispatch bay" } },
      create: {
        name: "Dispatch bay",
        location: "Loading area at the Lagos yard gate. Demo location.",
        branchId: branch.id,
        isDemo: true,
      },
      update: { location: "Loading area at the Lagos yard gate. Demo location.", isDemo: true },
    });

    const actor = await tx.userProfile.upsert({
      where: { clerkUserId: "demo-clerk-not-a-real-user" },
      create: {
        clerkUserId: "demo-clerk-not-a-real-user",
        name: "Demo Operations Manager",
        email: "demo-ops@example.invalid",
        role: "OPERATIONS_MANAGER",
        active: true,
        isDemo: true,
      },
      update: {
        name: "Demo Operations Manager",
        email: "demo-ops@example.invalid",
        role: "OPERATIONS_MANAGER",
        active: true,
        isDemo: true,
      },
    });

    const products = new Map<string, { id: string; unit: Unit; price: string }>();
    for (const item of catalogue) {
      const product = await tx.product.upsert({
        where: { sku: item.sku },
        create: {
          sku: item.sku,
          slug: item.slug,
          name: item.name,
          category: item.category,
          brand: item.brand,
          unit: item.unit,
          imageUrl: item.imageUrl,
          sellingPrice: unitPrice(item.price),
          currencyCode: currency,
          description: `${item.name} is a demo catalogue line for the proof of concept. ${DEMO_NOTE}`,
          active: true,
          isDemo: true,
        },
        update: {
          name: item.name,
          slug: item.slug,
          category: item.category,
          brand: item.brand,
          unit: item.unit,
          sellingPrice: unitPrice(item.price),
          currencyCode: currency,
          imageUrl: item.imageUrl,
          description: `${item.name} is a demo catalogue line for the proof of concept. ${DEMO_NOTE}`,
          active: true,
          isDemo: true,
        },
      });
      products.set(item.sku, { id: product.id, unit: item.unit, price: item.price });

      const mainQty = item.unit === "LOAD" ? "8" : item.unit === "PIECE" ? "2400" : "900";
      const dispatchQty = "100";
      await tx.inventory.upsert({
        where: { productId_warehouseId: { productId: product.id, warehouseId: mainStore.id } },
        create: {
          productId: product.id,
          warehouseId: mainStore.id,
          quantityOnHand: mainQty,
          reorderLevel: item.reorder,
          isDemo: true,
        },
        update: {
          quantityOnHand: mainQty,
          reorderLevel: item.reorder,
          isDemo: true,
        },
      });
      if (item.unit === "BAG") {
        await tx.inventory.upsert({
          where: { productId_warehouseId: { productId: product.id, warehouseId: dispatchBay.id } },
          create: {
            productId: product.id,
            warehouseId: dispatchBay.id,
            quantityOnHand: dispatchQty,
            reorderLevel: "40",
            isDemo: true,
          },
          update: { quantityOnHand: dispatchQty, reorderLevel: "40", isDemo: true },
        });
      }
    }

    const customers = [];
    for (const buyer of buyers) {
      const customer = await tx.customer.upsert({
        where: { email: buyer.email },
        create: {
          ...buyer,
          address: "Lagos collection address to be confirmed. Demo customer.",
          status: "ACTIVE",
          isDemo: true,
        },
        update: {
          businessName: buyer.businessName,
          contactPerson: buyer.contactPerson,
          phone: buyer.phone,
          customerType: buyer.customerType,
          address: "Lagos collection address to be confirmed. Demo customer.",
          status: "ACTIVE",
          isDemo: true,
        },
      });
      customers.push(customer);
    }

    const movementRefs = ["DEMO-MOV-HBM-OPEN", "DEMO-MOV-DNG-OPEN", "DEMO-MOV-BLK-ISSUE"];
    const existingMovement = await tx.stockMovement.findFirst({
      where: { reference: { in: movementRefs } },
    });
    if (!existingMovement) {
      const hbm = products.get("DEMO-HBM-50");
      const dng = products.get("DEMO-DNG-50");
      const blocks = products.get("DEMO-BLK-9");
      if (!hbm || !dng || !blocks) throw new Error("Demo products were not created");
      const movements: Array<{
        productId: string;
        warehouseId: string;
        type: "RECEIPT" | "ISSUE" | "TRANSFER_IN" | "TRANSFER_OUT";
        quantity: string;
        reference: string;
      }> = [
        { productId: hbm.id, warehouseId: mainStore.id, type: "RECEIPT", quantity: "1000", reference: "DEMO-MOV-HBM-OPEN" },
        { productId: hbm.id, warehouseId: mainStore.id, type: "TRANSFER_OUT", quantity: "100", reference: "DEMO-MOV-HBM-OPEN" },
        { productId: hbm.id, warehouseId: dispatchBay.id, type: "TRANSFER_IN", quantity: "100", reference: "DEMO-MOV-HBM-OPEN" },
        { productId: dng.id, warehouseId: mainStore.id, type: "RECEIPT", quantity: "1000", reference: "DEMO-MOV-DNG-OPEN" },
        { productId: dng.id, warehouseId: mainStore.id, type: "TRANSFER_OUT", quantity: "100", reference: "DEMO-MOV-DNG-OPEN" },
        { productId: dng.id, warehouseId: dispatchBay.id, type: "TRANSFER_IN", quantity: "100", reference: "DEMO-MOV-DNG-OPEN" },
        { productId: blocks.id, warehouseId: mainStore.id, type: "RECEIPT", quantity: "3000", reference: "DEMO-MOV-BLK-ISSUE" },
        { productId: blocks.id, warehouseId: mainStore.id, type: "ISSUE", quantity: "600", reference: "DEMO-MOV-BLK-ISSUE" },
      ];
      for (const item of catalogue) {
        if (item.sku === "DEMO-HBM-50" || item.sku === "DEMO-DNG-50" || item.sku === "DEMO-BLK-9") continue;
        const product = products.get(item.sku);
        if (!product) continue;
        const opening = item.unit === "LOAD" ? "8" : item.unit === "PIECE" ? "2400" : "900";
        movements.push({
          productId: product.id,
          warehouseId: mainStore.id,
          type: "RECEIPT",
          quantity: opening,
          reference: `DEMO-MOV-OPEN-${item.sku}`,
        });
      }
      for (const [index, movement] of movements.entries()) {
        await tx.stockMovement.create({
          data: {
            ...movement,
            quantity: quantity(movement.quantity),
            createdById: actor.id,
            isDemo: true,
            createdAt: new Date(Date.UTC(2026, 9, 1, 8, index)),
          },
        });
      }
    }

    for (let index = 0; index < 18; index += 1) {
      const orderNumber = `DEMO-YF-${String(1101 + index)}`;
      const existing = await tx.order.findUnique({ where: { orderNumber } });
      if (existing) continue;
      const customer = customers[index % customers.length];
      const first = catalogue[index % catalogue.length];
      const second = catalogue[(index + 4) % catalogue.length];
      const firstProduct = products.get(first.sku);
      const secondProduct = products.get(second.sku);
      if (!customer || !firstProduct || !secondProduct) throw new Error("Demo order references are missing");
      const firstLine = pricedLine(first.price, qtyFor(first.unit, index), index % 2 === 1);
      const secondLine = pricedLine(second.price, qtyFor(second.unit, index + 1), false);
      const subtotal = assertSubtotal([firstLine.lineTotal, secondLine.lineTotal], firstLine.lineTotal.plus(secondLine.lineTotal));
      await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: orderStatuses[index % orderStatuses.length],
          orderDate: new Date(Date.UTC(2026, 9, 1 + (index % 16), 9, 0)),
          subtotal,
          currencyCode: currency,
          notes: DEMO_NOTE,
          createdById: actor.id,
          branchId: branch.id,
          isDemo: true,
          items: {
            create: [
              { productId: firstProduct.id, ...firstLine },
              { productId: secondProduct.id, ...secondLine },
            ],
          },
        },
      });
    }

    for (let index = 0; index < 6; index += 1) {
      const quoteNumber = `DEMO-QT-${String(2101 + index)}`;
      const existing = await tx.quote.findUnique({ where: { quoteNumber } });
      if (existing) continue;
      const customer = customers[index];
      const item = catalogue[index];
      const product = products.get(item.sku);
      if (!customer || !product) throw new Error("Demo quote references are missing");
      const line = pricedLine(item.price, qtyFor(item.unit, index + 2), false);
      const subtotal = assertSubtotal([line.lineTotal], line.lineTotal);
      await tx.quote.create({
        data: {
          quoteNumber,
          customerId: customer.id,
          status: quoteStatuses[index],
          expiryDate: new Date(Date.UTC(2026, index === 4 ? 8 : 10, 15)),
          subtotal,
          currencyCode: currency,
          notes: DEMO_NOTE,
          branchId: branch.id,
          isDemo: true,
          items: { create: [{ productId: product.id, ...line }] },
        },
      });
    }

    const enquirySeeds = [
      { key: "DEMO-ENQ-01", kind: "QUOTE" as const, slug: "hbm-cement-50kg", sku: "DEMO-HBM-50", qty: "80", unit: "BAG" as const, label: "HBM Cement 50kg" },
      { key: "DEMO-ENQ-02", kind: "QUOTE" as const, slug: "sharp-sand", sku: "DEMO-SND-SH", qty: "3", unit: "LOAD" as const, label: "Sharp sand" },
      { key: "DEMO-ENQ-03", kind: "ACCOUNT" as const, slug: null, sku: null, qty: "1", unit: "BAG" as const, label: "Wholesale account request" },
      { key: "DEMO-ENQ-04", kind: "CONTACT" as const, slug: "granite", sku: "DEMO-GRN", qty: "2", unit: "LOAD" as const, label: "Granite chippings" },
    ];
    for (const [index, enquiry] of enquirySeeds.entries()) {
      const existing = await tx.enquiry.findFirst({ where: { message: { startsWith: enquiry.key } } });
      if (existing) continue;
      const product = enquiry.sku ? products.get(enquiry.sku) : undefined;
      await tx.enquiry.create({
        data: {
          kind: enquiry.kind,
          status: index === 0 ? "NEW" : index === 1 ? "REVIEWING" : index === 2 ? "REPLIED" : "CLOSED",
          customerName: `Demo Enquirer ${index + 1}`,
          businessName: `Demo Enquiry Business ${index + 1}`,
          phone: `0802000000${index + 1}`,
          email: `demo-enquiry-0${index + 1}@example.invalid`,
          location: "Lagos",
          productSlug: enquiry.slug,
          quantity: enquiry.qty,
          message: `${enquiry.key}. ${DEMO_NOTE}`,
          notes: `${enquiry.key}. ${DEMO_NOTE}`,
          isDemo: true,
          items: {
            create: {
              productId: product?.id,
              label: enquiry.label,
              quantity: quantity(enquiry.qty),
              unit: enquiry.unit,
            },
          },
        },
      });
    }

    const workflowQuoteNumber = "DEMO-QT-2201";
    const workflowOrderNumber = "DEMO-YF-1201";
    const workflowCustomer = customers[0];
    const workflowProduct = products.get("DEMO-HBM-50");
    let workflowQuote = await tx.quote.findUnique({ where: { quoteNumber: workflowQuoteNumber } });
    if (!workflowQuote && workflowCustomer && workflowProduct) {
      const line = pricedLine("9800.00", "40", false);
      const subtotal = assertSubtotal([line.lineTotal], line.lineTotal);
      workflowQuote = await tx.quote.create({
        data: {
          quoteNumber: workflowQuoteNumber,
          customerId: workflowCustomer.id,
          status: "ACCEPTED",
          expiryDate: new Date(Date.UTC(2026, 10, 30)),
          subtotal,
          currencyCode: currency,
          notes: `${DEMO_NOTE} Accepted quotation that was turned into a delivered order.`,
          branchId: branch.id,
          isDemo: true,
          items: { create: [{ productId: workflowProduct.id, ...line }] },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "STATUS_CHANGE",
          entityType: "Quote",
          entityId: workflowQuote.id,
          metadata: { from: "SENT", to: "ACCEPTED", demoKey: "DEMO-QT-2201-ACCEPT" },
          isDemo: true,
          createdAt: new Date(Date.UTC(2026, 9, 8, 11, 0)),
        },
      });
    }
    const workflowOrder = await tx.order.findUnique({ where: { orderNumber: workflowOrderNumber } });
    if (!workflowOrder && workflowQuote && workflowCustomer && workflowProduct) {
      const line = pricedLine("9800.00", "40", false);
      const subtotal = assertSubtotal([line.lineTotal], line.lineTotal);
      const delivered = await tx.order.create({
        data: {
          orderNumber: workflowOrderNumber,
          customerId: workflowCustomer.id,
          status: "DELIVERED",
          orderDate: new Date(Date.UTC(2026, 9, 12, 9, 0)),
          subtotal,
          currencyCode: currency,
          notes: `${DEMO_NOTE} Raised from ${workflowQuoteNumber} and moved through approval to delivery.`,
          createdById: actor.id,
          branchId: branch.id,
          quoteId: workflowQuote.id,
          isDemo: true,
          items: { create: [{ productId: workflowProduct.id, ...line }] },
        },
      });
      const steps = [
        { action: "CREATE" as const, metadata: { orderNumber: workflowOrderNumber, quoteNumber: workflowQuoteNumber }, at: new Date(Date.UTC(2026, 9, 12, 9, 0)) },
        { action: "STATUS_CHANGE" as const, metadata: { from: "DRAFT", to: "CONFIRMED" }, at: new Date(Date.UTC(2026, 9, 12, 10, 0)) },
        { action: "STATUS_CHANGE" as const, metadata: { from: "CONFIRMED", to: "PICKING" }, at: new Date(Date.UTC(2026, 9, 12, 12, 0)) },
        { action: "STATUS_CHANGE" as const, metadata: { from: "PICKING", to: "READY" }, at: new Date(Date.UTC(2026, 9, 13, 9, 0)) },
        { action: "STATUS_CHANGE" as const, metadata: { from: "READY", to: "DISPATCHED" }, at: new Date(Date.UTC(2026, 9, 13, 15, 0)) },
        { action: "STATUS_CHANGE" as const, metadata: { from: "DISPATCHED", to: "DELIVERED" }, at: new Date(Date.UTC(2026, 9, 14, 11, 0)) },
      ];
      for (const step of steps) {
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: step.action,
            entityType: "Order",
            entityId: delivered.id,
            metadata: { ...step.metadata, demoKey: workflowOrderNumber },
            isDemo: true,
            createdAt: step.at,
          },
        });
      }
    }

    const auditKey = "DEMO-AUDIT-SEED";
    const existingAudit = await tx.auditLog.findFirst({
      where: { metadata: { path: ["demoKey"], equals: auditKey } },
    });
    if (!existingAudit) {
      const firstOrder = await tx.order.findUnique({ where: { orderNumber: "DEMO-YF-1101" } });
      if (firstOrder) {
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "CREATE",
            entityType: "Order",
            entityId: firstOrder.id,
            metadata: { demoKey: auditKey, note: DEMO_NOTE },
            isDemo: true,
          },
        });
      }
    }
  }, { timeout: 60_000 });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
