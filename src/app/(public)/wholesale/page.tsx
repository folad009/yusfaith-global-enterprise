import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Wholesale and bulk orders",
  description: "How contractors, retailers, developers, and wholesale buyers request bulk materials from YUSFAITH.",
};

const points = [
  {
    title: "Who it is for",
    body: "Contractors, retailers, developers, and buyers who purchase cement and other materials in quantity.",
  },
  {
    title: "How a bulk order starts",
    body: "Send a quotation request with product, quantity, and location. The sales team replies with price and fulfilment notes.",
  },
  {
    title: "Accounts",
    body: "Repeat buyers can apply for a wholesale account. Approval happens with the sales team and is not automatic.",
  },
];

export default function WholesalePage() {
  return (
    <>
      <PageHeader eyebrow="Wholesale" title="Bulk orders, agreed before they move.">
        Wholesale supply is coordinated through a quotation. This page explains the path. It does not publish credit terms, minimum quantities, or delivery zones until the company confirms them.
      </PageHeader>
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
        {points.map((point) => (
          <article key={point.title} className="border-t border-line pt-4">
            <h2 className="font-display text-2xl text-ink">{point.title}</h2>
            <p className="mt-3 text-sm leading-6 text-base-content/75">{point.body}</p>
          </article>
        ))}
      </section>
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-3 px-6 py-12">
          <ButtonLink href="/quote?product=project-cement-release">Request a bulk quote</ButtonLink>
          <ButtonLink href="/account" variant="secondary">
            Apply for an account
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
