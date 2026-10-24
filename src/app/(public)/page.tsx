import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaqList } from "@/components/marketing/faq-list";
import { HomeMotion } from "@/components/motion/home-motion";
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

const marquee = "HBM  ·  Dangote  ·  Blocks  ·  Sharp sand  ·  Granite  ·  Bulk supply  ·  ";

const heading = "font-stamp font-extrabold uppercase leading-[0.88] tracking-tight";
const label = "font-stamp text-sm font-semibold uppercase tracking-[0.28em] text-[#e15a12]";

export default function HomePage() {
  const [lead, ...rest] = productCategories;

  return (
    <div className="overflow-x-clip bg-[#e7e5e2] text-[#1c1b19]">
      <HomeMotion />
      <section className="bg-black text-white" data-hero>
        <div className="grid min-h-[calc(100svh-7.25rem)] lg:grid-cols-12">
          <div className="relative z-10 flex flex-col justify-between px-6 py-10 sm:px-10 lg:col-span-7 lg:px-12 lg:py-12">
            <div className="flex items-start justify-between gap-6">
              <p className={label}>Cement and building materials</p>
              <p className="font-stamp text-sm uppercase tracking-[0.22em] text-white/45">Lagos yard</p>
            </div>
            <div className="mt-10">
              <h1 className={`${heading} max-w-4xl text-[16vw] text-white sm:text-7xl lg:text-[6.5rem]`}>
                <span className="block overflow-hidden">
                  <span data-hero-line className="block">A dependable</span>
                </span>
                <span className="block overflow-hidden">
                  <span data-hero-line className="block">supplier for</span>
                </span>
                <span className="block overflow-hidden">
                  <span data-hero-line className="block">wholesale</span>
                </span>
                <span className="block overflow-hidden">
                  <span data-hero-line className="block">materials.</span>
                </span>
              </h1>
              <p data-hero-copy className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                YUSFAITH GLOBAL ENTERPRISES supplies HBM and Dangote Cement, plus other building materials, to contractors, retailers, developers, and wholesale buyers. Ask for a quotation and the sales team will confirm what can be fulfilled.
              </p>
              <div data-hero-actions className="mt-8 flex flex-wrap gap-3">
                <Link href="/quote" className="inline-flex h-12 items-center bg-[#e15a12] px-6 text-sm font-semibold text-white">
                  Request a quote
                </Link>
                <Link href="/products" className="inline-flex h-12 items-center border border-white px-6 text-sm font-semibold text-white">
                  Explore products
                </Link>
              </div>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-xs uppercase tracking-[0.16em] text-white/55 sm:grid-cols-4">
              <div>
                <dt>Bag line</dt>
                <dd className="mt-1 font-stamp text-lg tracking-normal text-white">50kg</dd>
              </div>
              <div>
                <dt>Brands</dt>
                <dd className="mt-1 font-stamp text-lg tracking-normal text-white">HBM · Dangote</dd>
              </div>
              <div>
                <dt>Release</dt>
                <dd className="mt-1 font-stamp text-lg tracking-normal text-white">By quotation</dd>
              </div>
              <div>
                <dt>Desk</dt>
                <dd className="mt-1 font-stamp text-lg tracking-normal text-white">Sales team</dd>
              </div>
            </dl>
          </div>
          <div className="relative min-h-80 lg:col-span-5 lg:min-h-full">
            <div data-hero-photo className="absolute inset-0">
              <Image
                src="/images/hero-yard.jpg"
                alt="Cement pallets staged in an outdoor materials yard"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
            <span data-hero-mark className="absolute top-0 left-0 z-10 size-16 bg-[#e15a12] lg:size-24" aria-hidden="true" />
            <span className="absolute top-4 right-4 z-10 size-4 border-t border-r border-white/80" aria-hidden="true" />
            <span className="absolute right-4 bottom-4 z-10 size-4 border-r border-b border-white/80" aria-hidden="true" />
            <span className="absolute bottom-4 left-4 z-10 size-4 border-b border-l border-white/80" aria-hidden="true" />
            <p className="pointer-events-none absolute top-8 right-6 z-10 font-stamp text-xs tracking-[0.42em] text-white [writing-mode:vertical-rl]">
              YARD / NG
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f4ef]" aria-label="Supply lines" data-supply>
        <div data-supply-rule className="h-0.5 origin-left bg-[#e15a12]" />
        <ul className="mx-auto grid max-w-6xl sm:grid-cols-2 lg:grid-cols-4">
          {supplyLines.map((item, index) => (
            <li key={item} data-supply-item className="border-[#1c1b19]/10 px-6 py-8 lg:border-l lg:first:border-l-0">
              <p className="font-stamp text-sm tracking-[0.2em] text-[#e15a12]">0{index + 1}</p>
              <p className="mt-3 font-stamp text-2xl font-bold uppercase leading-none">{item}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="overflow-hidden border-y border-[#1c1b19]/15 bg-[#e7e5e2]" aria-hidden="true">
        <div data-marquee-track className="flex w-max">
          {[0, 1].map((copy) => (
            <p key={copy} className="font-stamp px-2 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-[#1c1b19]/80">
              {marquee.repeat(2)}
            </p>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24" data-manifest>
        <div className="flex flex-col gap-6 border-b border-[#1c1b19] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={label}>Bill of materials</p>
            <h2 className={`${heading} mt-3 text-5xl md:text-7xl`}>What you can enquire for</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#1c1b19]/70">
            Prices stay with the sales desk. This list is the yard catalogue.
          </p>
        </div>
        <article data-manifest-row className="grid border-b border-[#1c1b19]/20 lg:grid-cols-2">
          <Link href={`/products?category=${lead.slug}`} className="relative block min-h-72">
            <Image src={lead.image} alt={lead.imageAlt} fill className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
            <span className="absolute top-0 left-0 size-10 bg-[#e15a12]" aria-hidden="true" />
          </Link>
          <Link href={`/products?category=${lead.slug}`} className="flex flex-col justify-between bg-[#1c1b19] px-6 py-8 text-white sm:px-8">
            <p className="font-stamp text-sm tracking-[0.22em] text-[#e15a12]">{lead.index}</p>
            <div>
              <h3 className={`${heading} text-5xl text-white md:text-6xl`}>{lead.name}</h3>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/70">{lead.summary}</p>
            </div>
            <p className="mt-8 font-stamp text-sm uppercase tracking-[0.2em] text-[#e15a12]">Open the line</p>
          </Link>
        </article>
        <ul>
          {rest.map((category) => (
            <li key={category.slug} data-manifest-row className="border-b border-[#1c1b19]/20">
              <Link href={`/products?category=${category.slug}`} className="grid items-center gap-4 py-6 sm:grid-cols-[4rem_1fr_1.4fr_auto]">
                <span className="font-stamp text-3xl font-bold text-[#e15a12]">{category.index}</span>
                <span className={`${heading} text-3xl`}>{category.name}</span>
                <span className="text-sm leading-6 text-[#1c1b19]/70">{category.summary}</span>
                <span className="font-stamp text-sm uppercase tracking-[0.18em]">Enquire</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[#1c1b19] text-white" data-rail-pin>
        <div className="flex items-end justify-between gap-6 px-6 pt-12 pb-6 lg:px-10">
          <div>
            <p className={label}>In the yard</p>
            <h2 className={`${heading} mt-3 text-5xl text-white md:text-6xl`}>Stock on the rail</h2>
          </div>
          <p className="hidden max-w-[12rem] text-right font-stamp text-sm uppercase tracking-[0.18em] text-white/50 lg:block">
            Scroll to move the line
          </p>
        </div>
        <div className="overflow-x-auto lg:overflow-hidden" data-lenis-prevent>
          <div data-rail className="flex w-max gap-4 px-6 pb-14 lg:px-10">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="relative block h-[68vh] w-[78vw] max-w-md shrink-0 overflow-hidden sm:w-[46vw] lg:h-[62vh] lg:w-[34vw] lg:max-w-none"
              >
                <Image src={product.image} alt={product.imageAlt} fill className="object-cover" sizes="34vw" />
                <span className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/70 to-transparent" aria-hidden="true" />
                <span className="absolute top-0 left-0 h-1 w-12 bg-[#e15a12]" aria-hidden="true" />
                <span className="absolute top-4 left-4 font-stamp text-sm uppercase tracking-[0.2em] text-white">{product.unit}</span>
                <span className={`${heading} absolute inset-x-0 bottom-0 p-5 text-3xl text-white`}>{product.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f4ef]">
        <div className="grid lg:grid-cols-2">
          <div data-parallax className="relative min-h-80 overflow-hidden sm:min-h-[28rem] lg:min-h-[720px]">
            <div data-parallax-photo className="absolute inset-x-0 -top-[12%] h-[124%]">
              <Image
                src="/images/warehouse-aisle.jpg"
                alt="Warehouse aisle prepared for cement dispatch"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14 lg:py-20">
            <p className={label}>The company</p>
            <h2 className={`${heading} mt-3 text-5xl md:text-6xl`}>Supply, coordinated from the yard.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#1c1b19]/75">
              YUSFAITH GLOBAL ENTERPRISES distributes cement and building materials in Nigeria. This introduction is a short placeholder. A fuller company history can replace it when the business provides approved copy.
            </p>
            <h3 className={`${heading} mt-12 text-3xl`}>Why buyers work with the yard</h3>
            <ul className="mt-6">
              {reasons.map((reason, index) => (
                <li key={reason.title} data-reason className="border-b border-[#1c1b19]/15 py-5 last:border-b-0">
                  <div data-reason-rule className="mb-4 h-px origin-left bg-[#e15a12]" />
                  <div data-reason-copy>
                    <p className="font-stamp text-sm tracking-[0.2em] text-[#e15a12]">0{index + 1}</p>
                    <h4 className={`${heading} mt-2 text-2xl`}>{reason.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-[#1c1b19]/75">{reason.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#1c1b19] text-white" data-steps>
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <p className={label}>Sequence</p>
          <h2 className={`${heading} mt-3 text-5xl text-white md:text-6xl`}>How it works</h2>
          <div className="relative mt-12">
            <div className="absolute top-0 right-0 left-0 hidden h-px bg-white/20 lg:block" aria-hidden="true" />
            <div data-steps-line className="absolute top-0 right-0 left-0 hidden h-px origin-left bg-[#e15a12] lg:block" aria-hidden="true" />
            <ol className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:pt-8">
              {steps.map((step) => (
                <li key={step.index} className="border-t border-white/15 pt-5 lg:border-t-0 lg:pt-0">
                  <p className="font-stamp text-5xl font-extrabold leading-none text-[#e15a12]">{step.index}</p>
                  <h3 className={`${heading} mt-4 text-2xl text-white`}>{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[12rem_1fr] lg:py-24">
        <p className={label}>Note</p>
        <div>
          <h2 className={`${heading} text-5xl md:text-6xl`}>Distribution and delivery</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#1c1b19]/75">
            Collection and delivery are arranged after a quotation is accepted. Coverage, vehicle types, and lead times are not listed here yet. Treat this paragraph as an editable placeholder until the company publishes its distribution notes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16 lg:pb-24">
        <h2 className={`${heading} text-5xl md:text-6xl`}>Questions</h2>
        <div className="mt-8">
          <FaqList />
        </div>
      </section>

      <section className="bg-black text-white" data-cta>
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-end lg:py-20">
          <div>
            <p className={label}>Sales desk</p>
            <h2 className={`${heading} mt-3 text-5xl text-white md:text-7xl`}>
              <span className="block overflow-hidden">
                <span data-cta-line className="block">Ready to ask the yard?</span>
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
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
