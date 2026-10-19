import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/marketing/page-header";
import { QuoteRequest } from "@/components/marketing/quote-request";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Send a product and quantity enquiry to YUSFAITH GLOBAL ENTERPRISES.",
};

export default function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  return (
    <>
      <PageHeader eyebrow="Quote" title="Request a quote">
        Tell the yard what you need. The form checks your details here, checks them again on the server, and stores the enquiry. It does not confirm a price or reserve stock.
      </PageHeader>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <QuoteRequest searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
