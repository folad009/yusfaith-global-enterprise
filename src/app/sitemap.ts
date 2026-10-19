import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";
import { siteUrl } from "@/lib/contact";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const staticRoutes = ["", "/about", "/products", "/wholesale", "/quote", "/contact", "/account"];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
