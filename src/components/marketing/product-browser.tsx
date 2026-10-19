import { filterProducts, productCategories } from "@/lib/catalog";
import { ProductCard } from "@/components/ui/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import { SelectInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export async function ProductBrowser({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  return <ProductBrowserView query={params.q ?? ""} category={params.category ?? ""} />;
}

export function ProductBrowserView({ query, category }: { query: string; category: string }) {
  const results = filterProducts(query, category);

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <form className="flex flex-col gap-3 md:flex-row" action="/products">
        <SearchField name="q" defaultValue={query} placeholder="Search products" />
        <label className="md:w-64">
          <span className="sr-only">Category</span>
          <SelectInput name="category" defaultValue={category}>
            <option value="">All categories</option>
            {productCategories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </SelectInput>
        </label>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>
      {results.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No products match"
            description="Clear the search or choose another category to see the catalogue again."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((product) => (
            <ProductCard
              key={product.slug}
              name={product.name}
              brand={product.brand}
              detail={product.summary}
              unit={product.unit}
              image={product.image}
              imageAlt={product.imageAlt}
              href={`/products/${product.slug}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
