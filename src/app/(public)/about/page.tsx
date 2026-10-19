import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About us",
  description: "YUSFAITH GLOBAL ENTERPRISES supplies cement and building materials to wholesale buyers in Nigeria.",
};

const heading = "font-display font-extrabold uppercase leading-[0.95] tracking-tight";
const label = "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e15a12]";

const team = [
  {
    name: "Alhaji Fatai Yusuf Olatunji",
    position: "MD/CEO",
    image: "/images/Alhaji Fatai Yusuf Olatunji - MD:CEO.jpg",
  },
  {
    name: "Abdulrahman Adebayo Obawunmi",
    position: "GM Yusfaith Global",
    image: "/images/Abdulrahman Adebayo Obawunmi - GM Yusfaith Global.jpg",
  },
  {
    name: "Akindele Akeem Oluwaseun",
    position: "HOS Dangote",
    image: "/images/Akindele Akeem Oluwaseun - HOS Dangote.jpg",
  },
  {
    name: "Nurudeen Olatunji Lawal",
    position: "Logistics Manager",
    image: "/images/Nurudeen Olatunji Lawal - Logistics Manager.jpg",
  },
  {
    name: "Oduwole Yusuf Olayemi",
    position: "Auditor",
    image: "/images/Oduwole Yusuf Olayemi - Auditor.jpg",
  },
  {
    name: "Morenikeji Bello",
    position: "Accountant",
    image: "/images/Morenikeji Bello - Accounant.jpg",
  },
] as const;

const testimonies = [
  {
    quote:
      "We sent the product and quantity, and the sales team replied with a quotation before the order was confirmed.",
    name: "Contractor",
    role: "Wholesale buyer",
  },
  {
    quote:
      "Collection was arranged after the quotation. That is how we needed the yard to work.",
    name: "Retailer",
    role: "Wholesale buyer",
  },
  {
    quote:
      "One enquiry covered the cement and the other materials for the job.",
    name: "Developer",
    role: "Wholesale buyer",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="bg-[#e7e5e2] text-[#1c1b19]">
      <section className="relative flex min-h-[420px] items-center justify-center">
        <Image
          src="/images/hero-yard.jpg"
          alt="Cement pallets staged in an outdoor materials yard"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        <div className="relative px-6 py-20 text-center text-white">
          <p className={label}>About us</p>
          <h1 className={`${heading} mx-auto mt-4 max-w-4xl text-4xl text-white md:text-6xl`}>
            A yard built around wholesale supply.
          </h1>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="grid grid-cols-5 gap-4">
            <div className="relative col-span-3 min-h-72 sm:min-h-96">
              <Image
                src="/images/warehouse-aisle.jpg"
                alt="Warehouse aisle prepared for cement dispatch"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 30vw, 60vw"
              />
            </div>
            <div className="relative col-span-2 mt-10 min-h-56 sm:mt-16 sm:min-h-72">
              <Image
                src="/images/blocks.jpg"
                alt="Concrete blocks stacked for collection"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 18vw, 40vw"
              />
            </div>
          </div>
          <div>
            <p className="text-sm leading-7 text-[#1c1b19]/75">
              YUSFAITH GLOBAL ENTERPRISES supplies HBM cement, Dangote Cement, and other building materials to contractors, retailers, developers, and wholesale buyers. This page uses short placeholder copy until the company provides an approved history.
            </p>
            <h2 className={`${heading} mt-8 text-4xl md:text-5xl`}>What the business does</h2>
            <p className="mt-4 text-sm leading-7 text-[#1c1b19]/75">
              Buyers enquire for bagged cement and other materials. The sales team issues a quotation. An order is confirmed with that team, then the yard prepares collection or a delivery that was agreed in the quotation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex h-12 items-center bg-[#e15a12] px-6 text-sm font-semibold text-white">
                Explore products
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center border border-[#e15a12] bg-transparent px-6 text-sm font-semibold text-[#e15a12]"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black text-white" aria-label="The team">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <p className={`${label} text-center`}>The team</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((person) => (
              <li key={person.name} className="bg-white text-[#1c1b19]">
                <div className="relative aspect-[3/4] bg-neutral">
                  <Image
                    src={person.image}
                    alt={`${person.name}, ${person.position}`}
                    fill
                    className="object-cover object-top"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="px-5 py-5">
                  <h3 className={`${heading} text-xl`}>{person.name}</h3>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e15a12]">{person.position}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white" aria-label="Client testimonies">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <p className={`${label} text-center`}>Client testimonies</p>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-[#1c1b19]/75">
            Sample quotes until the company supplies approved client testimonies.
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonies.map((item) => (
              <li key={item.name} className="bg-[#f7f4ef] p-6">
                <p className="font-display text-6xl leading-none text-[#e15a12]" aria-hidden="true">
                  “
                </p>
                <blockquote className="mt-2 text-sm leading-7 text-[#1c1b19]/80">{item.quote}</blockquote>
                <p className={`${heading} mt-6 text-base`}>{item.name}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e15a12]">{item.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-24">
        <h2 className={`${heading} text-4xl md:text-5xl`}>What this site does not claim</h2>
        <p className="mt-5 text-sm leading-7 text-[#1c1b19]/75">
          Client testimonies on this page are samples until the company supplies approved quotes. There are no certifications or official endorsements on this site. Brand names are text treatments until logo files are supplied. A street address and public phone number stay unpublished until the company provides them.
        </p>
      </section>
    </div>
  );
}
