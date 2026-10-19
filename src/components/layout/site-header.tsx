"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ButtonLink } from "@/components/ui/button";
import { contactEmail, whatsappHref, whatsappNumber } from "@/lib/contact";
import { publicLinks } from "@/lib/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/" || pathname === "/about";
  const email = contactEmail();
  const phone = whatsappNumber();
  const whatsapp = whatsappHref("Hello YUSFAITH, I would like to ask about building materials.");
  const showStrip = home && Boolean(email || (whatsapp && phone));

  if (!home) {
    return (
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-6">
          <Wordmark />
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-ink/80 hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:block">
            <ButtonLink href="/quote">Request a quote</ButtonLink>
          </div>
          <MobileNav />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white">
      {showStrip ? (
        <div className="bg-[#e15a12] text-white">
          <div className="mx-auto flex h-9 max-w-6xl items-center justify-center gap-6 px-6 text-xs">
            {email ? <a href={`mailto:${email}`}>{email}</a> : null}
            {whatsapp && phone ? (
              <a href={whatsapp} target="_blank" rel="noreferrer">
                WhatsApp {phone}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="relative border-b border-[#e4e1dc]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-6">
          <Wordmark />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1b19] hover:text-[#e15a12]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/quote"
            className="hidden h-11 items-center bg-[#e15a12] px-5 text-sm font-semibold text-white lg:inline-flex"
          >
            Request a quote
          </Link>
          <MobileNav uppercase />
        </div>
      </div>
    </header>
  );
}
