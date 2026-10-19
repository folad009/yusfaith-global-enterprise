"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { enquiryLinks, publicLinks } from "@/lib/navigation";

export function MobileNav({ uppercase = false }: { uppercase?: boolean }) {
  const [open, setOpen] = useState(false);
  const linkClass = uppercase
    ? "block py-3 text-xs font-semibold uppercase tracking-[0.14em]"
    : "block py-3 text-sm";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className={
          uppercase
            ? "inline-flex h-11 items-center px-3 text-[#1c1b19]"
            : "btn btn-ghost h-11 min-h-11 rounded-sm px-3"
        }
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      {open ? (
        <nav
          id="mobile-navigation"
          className={
            uppercase
              ? "absolute inset-x-0 top-full border-b border-[#e4e1dc] bg-white px-6 py-4"
              : "absolute inset-x-0 top-full border-b border-line bg-paper px-6 py-4"
          }
        >
          <ul className="grid gap-1">
            {publicLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
            {enquiryLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
