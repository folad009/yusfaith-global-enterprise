import type { OrderStatus } from "@/lib/portal/status";

export type PortalMetric = {
  label: string;
  value: string;
  detail: string;
};

export type PortalOrderRow = {
  id: string;
  customer: string;
  product: string;
  quantity: string;
  yard: string;
  status: OrderStatus;
};

export type DashboardSample = {
  metrics: PortalMetric[];
  weeklyOrders: Array<{ day: string; orders: number }>;
  recentOrders: PortalOrderRow[];
};

export const dashboardSample: DashboardSample = {
  metrics: [
    { label: "Open orders", value: "18", detail: "Confirmed, picking, and ready" },
    { label: "Cement on hand", value: "1,240", detail: "Bags at Lagos Yard" },
    { label: "Deliveries today", value: "6", detail: "Scheduled from the same yard" },
    { label: "Wholesale accounts", value: "42", detail: "Active buyers in the sample book" },
  ],
  weeklyOrders: [
    { day: "Mon", orders: 6 },
    { day: "Tue", orders: 9 },
    { day: "Wed", orders: 7 },
    { day: "Thu", orders: 11 },
    { day: "Fri", orders: 8 },
    { day: "Sat", orders: 4 },
  ],
  recentOrders: [
    {
      id: "YF-1048",
      customer: "Adebola Sites Ltd",
      product: "Dangote Cement 50kg",
      quantity: "400 bags",
      yard: "Lagos Yard",
      status: "picking",
    },
    {
      id: "YF-1047",
      customer: "Mainland Block Mart",
      product: "HBM Cement 50kg",
      quantity: "220 bags",
      yard: "Lagos Yard",
      status: "ready",
    },
    {
      id: "YF-1046",
      customer: "Okoye Developments",
      product: "Sharp sand",
      quantity: "3 loads",
      yard: "Lagos Yard",
      status: "confirmed",
    },
    {
      id: "YF-1045",
      customer: "Harbour Retail",
      product: "9-inch solid blocks",
      quantity: "1,200 pcs",
      yard: "Lagos Yard",
      status: "dispatched",
    },
  ],
};
