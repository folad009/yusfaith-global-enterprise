export const portalRoles = [
  "super_admin",
  "operations_manager",
  "sales_officer",
  "warehouse_officer",
  "wholesale_customer",
] as const;

export type PortalRole = (typeof portalRoles)[number];

export const roleLabels: Record<PortalRole, string> = {
  super_admin: "Super Admin",
  operations_manager: "Operations Manager",
  sales_officer: "Sales Officer",
  warehouse_officer: "Warehouse Officer",
  wholesale_customer: "Wholesale Customer",
};

export type PortalSection =
  | "dashboard"
  | "orders"
  | "products"
  | "inventory"
  | "customers"
  | "quotes"
  | "reports"
  | "settings";

const staff: PortalRole[] = [
  "super_admin",
  "operations_manager",
  "sales_officer",
  "warehouse_officer",
];

const commercial: PortalRole[] = ["super_admin", "operations_manager", "sales_officer"];

export const portalNav: Array<{
  section: PortalSection;
  href: string;
  label: string;
  description: string;
  action: string;
  roles: PortalRole[];
}> = [
  {
    section: "dashboard",
    href: "/portal",
    label: "Overview",
    description: "Yard activity for the signed-in role.",
    action: "Open orders",
    roles: [...staff, "wholesale_customer"],
  },
  {
    section: "orders",
    href: "/portal/orders",
    label: "Orders",
    description: "Wholesale releases recorded against the Lagos yard.",
    action: "Record order",
    roles: [...staff, "wholesale_customer"],
  },
  {
    section: "products",
    href: "/portal/products",
    label: "Products",
    description: "Materials offered from the yard catalogue.",
    action: "Add product",
    roles: [...staff, "wholesale_customer"],
  },
  {
    section: "inventory",
    href: "/portal/inventory",
    label: "Inventory",
    description: "On-hand quantities at the Lagos yard.",
    action: "Adjust stock",
    roles: ["super_admin", "operations_manager", "warehouse_officer"],
  },
  {
    section: "customers",
    href: "/portal/customers",
    label: "Customers",
    description: "Wholesale buyers and account applications.",
    action: "Add customer",
    roles: [...commercial, "wholesale_customer"],
  },
  {
    section: "quotes",
    href: "/portal/quotes",
    label: "Quotes",
    description: "Price and quantity requests awaiting a reply.",
    action: "New quote",
    roles: [...commercial, "wholesale_customer"],
  },
  {
    section: "reports",
    href: "/portal/reports",
    label: "Reports",
    description: "Operating summaries for the current yard.",
    action: "Export report",
    roles: ["super_admin", "operations_manager"],
  },
  {
    section: "settings",
    href: "/portal/settings",
    label: "Settings",
    description: "Yard profile and access for this deployment.",
    action: "Save settings",
    roles: ["super_admin"],
  },
];

export function isPortalRole(value: unknown): value is PortalRole {
  return typeof value === "string" && portalRoles.some((role) => role === value);
}

export function canAccess(role: PortalRole, section: PortalSection) {
  const item = portalNav.find((entry) => entry.section === section);
  return item ? item.roles.includes(role) : false;
}

export function navForRole(role: PortalRole | null) {
  if (!role) return [];
  return portalNav.filter((item) => item.roles.includes(role));
}

export function sectionFromPath(pathname: string): PortalSection {
  const match = portalNav
    .filter((item) => item.href !== "/portal")
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.section ?? "dashboard";
}
