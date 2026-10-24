"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wordmark } from "@/components/brand/wordmark";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/cn";
import { contactEmail, whatsappHref, whatsappNumber } from "@/lib/contact";
import { publicLinks } from "@/lib/navigation";

gsap.registerPlugin(ScrollTrigger);

export function SiteHeader() {
  const pathname = usePathname();
  const showcase = pathname === "/" || pathname === "/about";
  const email = contactEmail();
  const phone = whatsappNumber();
  const whatsapp = whatsappHref("Hello YUSFAITH, I would like to ask about building materials.");
  const showStrip = showcase && Boolean(email || (whatsapp && phone));
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!showcase) {
      setSettled(false);
      return;
    }

    const trigger = ScrollTrigger.create({
      start: 64,
      end: 99999,
      onToggle: (self) => setSettled(self.isActive),
    });
    setSettled(window.scrollY > 64);

    return () => trigger.kill();
  }, [showcase]);

  return (
    <header className="sticky top-0 z-40">
      {showStrip ? (
        <div
          className="overflow-hidden bg-[#e15a12] text-white transition-[height,opacity] duration-300"
          style={{ height: settled ? 0 : "2.25rem", opacity: settled ? 0 : 1 }}
        >
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
      <div
        className={cn(
          "border-b",
          settled || !showcase ? "border-[#1c1b19]/10 bg-[#e7e5e2]" : "border-[#e4e1dc] bg-white",
        )}
      >
        <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-6">
          <Wordmark />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-stamp text-sm font-semibold uppercase tracking-[0.16em] text-[#1c1b19] hover:text-[#e15a12]"
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
