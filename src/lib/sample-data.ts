import type { OrderStatus } from "@/lib/portal/status";

export type { OrderStatus };

export type SampleOrder = {
  id: string;
  customer: string;
  product: string;
  quantity: string;
  yard: string;
  status: OrderStatus;
};

export const categories = [
  {
    index: "01",
    name: "Cement",
    summary: "Bagged cement for contractors, retailers, and project sites.",
    image: "/images/warehouse-aisle.jpg",
    imageAlt: "Pallets of unmarked cement sacks in a warehouse aisle",
  },
  {
    index: "02",
    name: "Blocks",
    summary: "Concrete masonry blocks stocked for ongoing site demand.",
    image: "/images/blocks.jpg",
    imageAlt: "A stacked grid of grey concrete blocks",
  },
  {
    index: "03",
    name: "Aggregates",
    summary: "Sharp sand and granite for structural and finishing work.",
    image: "/images/aggregates.jpg",
    imageAlt: "Piles of sand and granite at a materials yard",
  },
  {
    index: "04",
    name: "Yard supply",
    summary: "Wholesale collection and scheduled delivery from the Lagos yard.",
    image: "/images/hero-yard.jpg",
    imageAlt: "Outdoor materials yard with stacked cement pallets",
  },
] as const;

export const products = [
  {
    name: "Dangote Cement 50kg",
    brand: "Dangote Cement",
    detail: "General-purpose bagged cement for structural work.",
    unit: "Per bag",
    image: "/images/warehouse-aisle.jpg",
    imageAlt: "Warehouse pallets prepared for bagged cement dispatch",
  },
  {
    name: "HBM Cement 50kg",
    brand: "HBM",
    detail: "Bagged cement held for wholesale and project release.",
    unit: "Per bag",
    image: "/images/hero-yard.jpg",
    imageAlt: "Cement pallets staged in the outdoor yard",
  },
  {
    name: "9-inch solid blocks",
    brand: "Yard stock",
    detail: "Concrete blocks issued by piece or by load.",
    unit: "Per piece",
    image: "/images/blocks.jpg",
    imageAlt: "Concrete blocks stacked for collection",
  },
  {
    name: "Sharp sand",
    brand: "Yard stock",
    detail: "Washed sharp sand supplied by tipper load.",
    unit: "Per load",
    image: "/images/aggregates.jpg",
    imageAlt: "Sharp sand and granite stored in separate bays",
  },
] as const;

export const orders: SampleOrder[] = [
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
  {
    id: "YF-1044",
    customer: "Ikeja Contractors",
    product: "Dangote Cement 50kg",
    quantity: "150 bags",
    yard: "Lagos Yard",
    status: "confirmed",
  },
  {
    id: "YF-1043",
    customer: "Lekki Frame Co.",
    product: "HBM Cement 50kg",
    quantity: "80 bags",
    yard: "Lagos Yard",
    status: "ready",
  },
  {
    id: "YF-1042",
    customer: "Surulere Builders",
    product: "Sharp sand",
    quantity: "1 load",
    yard: "Lagos Yard",
    status: "picking",
  },
  {
    id: "YF-1041",
    customer: "Northgate Homes",
    product: "9-inch solid blocks",
    quantity: "600 pcs",
    yard: "Lagos Yard",
    status: "dispatched",
  },
];

export const weeklyOrders = [
  { day: "Mon", orders: 6 },
  { day: "Tue", orders: 9 },
  { day: "Wed", orders: 7 },
  { day: "Thu", orders: 11 },
  { day: "Fri", orders: 8 },
  { day: "Sat", orders: 4 },
];

export const buyerTypes = [
  { value: "contractor", label: "Contractor" },
  { value: "retailer", label: "Retailer" },
  { value: "developer", label: "Developer" },
  { value: "wholesale", label: "Wholesale buyer" },
] as const;
