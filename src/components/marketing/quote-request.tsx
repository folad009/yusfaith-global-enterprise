import { getProduct } from "@/lib/catalog";
import { QuoteForm } from "@/components/marketing/quote-form";

export async function QuoteRequest({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const params = await searchParams;
  const product = params.product ? getProduct(params.product) : undefined;
  return <QuoteForm initialProduct={product?.slug} />;
}
