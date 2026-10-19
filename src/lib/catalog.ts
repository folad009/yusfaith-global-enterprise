export const productCategories = [
  {
    slug: "hbm",
    index: "01",
    name: "HBM Cement",
    summary: "Bagged HBM cement for wholesale and project release.",
    image: "/images/hero-yard.jpg",
    imageAlt: "Cement pallets staged in an outdoor materials yard",
  },
  {
    slug: "dangote",
    index: "02",
    name: "Dangote Cement",
    summary: "Bagged Dangote Cement held for contractor and retailer orders.",
    image: "/images/warehouse-aisle.jpg",
    imageAlt: "Pallets of unmarked cement sacks in a warehouse aisle",
  },
  {
    slug: "other",
    index: "03",
    name: "Other building materials",
    summary: "Blocks, sand, and granite stocked alongside cement.",
    image: "/images/aggregates.jpg",
    imageAlt: "Piles of sand and granite at a materials yard",
  },
  {
    slug: "bulk",
    index: "04",
    name: "Bulk and project supply",
    summary: "Larger releases coordinated through a quotation.",
    image: "/images/blocks.jpg",
    imageAlt: "Concrete blocks stacked for collection",
  },
] as const;

export type CategorySlug = (typeof productCategories)[number]["slug"];

export type CatalogProduct = {
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  summary: string;
  description: string;
  unit: string;
  image: string;
  imageAlt: string;
};

export const products: CatalogProduct[] = [
  {
    slug: "hbm-cement-50kg",
    name: "HBM Cement 50kg",
    brand: "HBM",
    category: "hbm",
    summary: "Bagged cement for wholesale buyers and site releases.",
    description:
      "A 50kg bag line supplied by YUSFAITH. Prices, current yard stock, and release dates are confirmed in a quotation. This catalogue entry is editable placeholder copy until the company supplies product specifications.",
    unit: "Per bag",
    image: "/images/hero-yard.jpg",
    imageAlt: "Cement pallets in the outdoor yard",
  },
  {
    slug: "dangote-cement-50kg",
    name: "Dangote Cement 50kg",
    brand: "Dangote Cement",
    category: "dangote",
    summary: "Bagged cement for structural work and retail resale.",
    description:
      "A 50kg bag line supplied by YUSFAITH. Brand artwork on this page is a text treatment until an approved logo file is provided. Availability is confirmed when the sales team issues a quotation.",
    unit: "Per bag",
    image: "/images/warehouse-aisle.jpg",
    imageAlt: "Warehouse aisle with pallets prepared for dispatch",
  },
  {
    slug: "nine-inch-blocks",
    name: "9-inch solid blocks",
    brand: "Yard stock",
    category: "other",
    summary: "Concrete blocks issued by piece or by load.",
    description:
      "Placeholder catalogue line for masonry blocks. Dimensions, strength, and piece counts should be replaced when the company publishes its block specification.",
    unit: "Per piece",
    image: "/images/blocks.jpg",
    imageAlt: "A stacked grid of grey concrete blocks",
  },
  {
    slug: "sharp-sand",
    name: "Sharp sand",
    brand: "Yard stock",
    category: "other",
    summary: "Sand supplied by tipper load after quotation.",
    description:
      "Placeholder catalogue line for sharp sand. Load size and source details will be added when the company confirms them.",
    unit: "Per load",
    image: "/images/aggregates.jpg",
    imageAlt: "Sand and granite stored in separate bays",
  },
  {
    slug: "granite",
    name: "Granite chippings",
    brand: "Yard stock",
    category: "other",
    summary: "Granite for structural and finishing work.",
    description:
      "Placeholder catalogue line for granite. Nominal sizes will be listed here when the yard publishes them.",
    unit: "Per load",
    image: "/images/aggregates.jpg",
    imageAlt: "Aggregate bays at a materials depot",
  },
  {
    slug: "project-cement-release",
    name: "Project cement release",
    brand: "Bulk supply",
    category: "bulk",
    summary: "A coordinated cement release for a named project.",
    description:
      "Use this line when a contractor or developer needs a bulk cement release rather than a small collection. Quantity, schedule, and collection or delivery are agreed in the quotation. This description is a placeholder.",
    unit: "By quotation",
    image: "/images/warehouse-aisle.jpg",
    imageAlt: "Interior of a cement warehouse",
  },
];

export function getCategory(slug: string) {
  return productCategories.find((category) => category.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function filterProducts(query: string, category: string) {
  const needle = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = category.length === 0 || product.category === category;
    const matchesQuery =
      needle.length === 0 ||
      product.name.toLowerCase().includes(needle) ||
      product.brand.toLowerCase().includes(needle) ||
      product.summary.toLowerCase().includes(needle);
    return matchesCategory && matchesQuery;
  });
}
