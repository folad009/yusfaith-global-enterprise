import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { FaqList } from "@/components/marketing/faq-list";
import { productCategories, products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Cement and building materials",
  description:
    "YUSFAITH GLOBAL ENTERPRISES supplies HBM cement, Dangote Cement, and other building materials to wholesale buyers in Nigeria.",
};

const reasons = [
  {
    title: "Reliable supply coordination",
    body: "Enquiries are handled as yard work: product, quantity, and timing are confirmed before an order is accepted.",
  },
  {
    title: "Wholesale purchasing support",
    body: "Contractors, retailers, developers, and wholesale buyers can request bulk quantities through one quotation.",
  },
  {
    title: "Transparent quotation process",
    body: "You see the product and quantity you asked for. A price is sent back by the sales team, not calculated on this page.",
  },
  {
    title: "Dedicated customer assistance",
    body: "A person on the sales desk follows the enquiry through quotation and order confirmation.",
  },
];

const steps = [
  { index: "01", title: "Explore products", body: "Review the catalogue and choose the material you need." },
  { index: "02", title: "Submit your order enquiry", body: "Send a quote request with quantity, location, and contact details." },
  { index: "03", title: "Receive a quotation", body: "The sales team replies with price and fulfilment notes." },
  { index: "04", title: "Confirm your order", body: "The order is agreed with the sales team. The website does not confirm it for you." },
];

const supplyLines = ["HBM Cement", "Dangote Cement", "Other building materials", "Wholesale and bulk supply"];

const heading = "font-display font-extrabold uppercase leading-[0.95] tracking-tight";
const label = "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e15a12]";

export default function HomePage() {
  const featured = products.slice(0, 4);

  return (
    <div className="bg-[#e7e5e2] text-[#1c1b19]">
      <section className="grid lg:min-h-[640px] lg:grid-cols-2">
        <div className="relative flex flex-col justify-center bg-black px-6 py-16 text-white sm:px-10 lg:px-14 lg:py-20">
          <span className="absolute top-0 left-0 size-16 bg-[#e15a12]" aria-hidden="true" />
          <p className={`${label} mt-6`}>{`Cement and building materials`}</p>
          <h1 className={`${heading} mt-5 max-w-xl text-4xl text-white sm:text-5xl lg:text-6xl`}>
            A dependable supplier for wholesale building materials.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            YUSFAITH GLOBAL ENTERPRISES supplies HBM and Dangote Cement, plus other building materials, to contractors, retailers, developers, and wholesale buyers. Ask for a quotation and the sales team will confirm what can be fulfilled.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="inline-flex h-12 items-center bg-[#e15a12] px-6 text-sm font-semibold text-white"
            >
              Request a quote
            </Link>
            <Link
              href="/products"
              className="inline-flex h-12 items-center border border-white bg-transparent px-6 text-sm font-semibold text-white"
            >
              Explore products
            </Link>
          </div>
        </div>
        <div className="relative min-h-72 sm:min-h-96 lg:min-h-full">
          <Image
            src="/images/hero-yard.jpg"
            alt="Cement pallets staged in an outdoor materials yard"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="bg-white" aria-label="Supply lines">
        <ul className="mx-auto grid max-w-6xl sm:grid-cols-2 lg:grid-cols-4">
          {supplyLines.map((item) => (
            <li key={item} className="px-6 py-8">
              <span className="mb-4 block h-0.5 w-10 bg-[#e15a12]" aria-hidden="true" />
              <p className="text-sm font-semibold tracking-wide text-[#1c1b19]">{item}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className={label}>Product categories</p>
          <h2 className={`${heading} mt-3 text-4xl md:text-5xl`}>What you can enquire for</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="flex flex-col bg-white"
            >
              <div className="relative aspect-[4/3] bg-neutral">
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#e15a12]">{category.index}</p>
                <h3 className={`${heading} mt-2 text-xl`}>{category.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#1c1b19]/75">{category.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 lg:pb-24" aria-label="Featured products">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-neutral">
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
              <span className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent" aria-hidden="true" />
              <h3 className={`${heading} absolute inset-x-0 bottom-0 p-5 text-xl text-white`}>{product.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
          <div className="relative min-h-72 sm:min-h-96 lg:min-h-[640px]">
            <Image
              src="/images/warehouse-aisle.jpg"
              alt="Warehouse aisle prepared for cement dispatch"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14 lg:py-20">
            <p className={label}>The company</p>
            <h2 className={`${heading} mt-3 text-4xl md:text-5xl`}>Supply, coordinated from the yard.</h2>
            <p className="mt-4 text-sm leading-7 text-[#1c1b19]/75">
              YUSFAITH GLOBAL ENTERPRISES distributes cement and building materials in Nigeria. This introduction is a short placeholder. A fuller company history can replace it when the business provides approved copy.
            </p>
            <h3 className={`${heading} mt-10 text-2xl`}>Why buyers work with the yard</h3>
            <ul className="mt-6 grid gap-5">
              {reasons.map((reason) => (
                <li key={reason.title} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center bg-[#e15a12] text-white">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className={`${heading} text-base`}>{reason.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-[#1c1b19]/75">{reason.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative">
        <Image
          src="/images/blocks.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/75" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <h2 className={`${heading} text-center text-4xl text-white md:text-5xl`}>How it works</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <li key={step.index} className="bg-[#e15a12] p-6 text-white">
                <p className="font-display text-3xl font-extrabold leading-none">{step.index}</p>
                <h3 className={`${heading} mt-4 text-lg`}>{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/90">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-24">
        <h2 className={`${heading} text-4xl md:text-5xl`}>Distribution and delivery</h2>
        <p className="mt-4 text-sm leading-7 text-[#1c1b19]/75">
          Collection and delivery are arranged after a quotation is accepted. Coverage, vehicle types, and lead times are not listed here yet. Treat this paragraph as an editable placeholder until the company publishes its distribution notes.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16 lg:pb-24">
        <h2 className={`${heading} text-center text-4xl md:text-5xl`}>Questions</h2>
        <div className="mt-8">
          <FaqList />
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center lg:py-20">
          <div>
            <h2 className={`${heading} text-4xl text-white md:text-5xl`}>Ready to ask the yard?</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
              Send a quotation request or speak with the sales team once contact details are published.
            </p>
          </div>
          <Link href="/quote" className="inline-flex h-12 shrink-0 items-center bg-[#e15a12] px-6 text-sm font-semibold text-white">
            Request a quote
          </Link>
        </div>
      </section>
    </div>
  );
}
