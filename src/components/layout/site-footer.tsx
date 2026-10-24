import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { contactEmail, whatsappHref, whatsappNumber } from "@/lib/contact";
import { enquiryLinks, publicLinks } from "@/lib/navigation";

export function SiteFooter() {
  const email = contactEmail();
  const phone = whatsappNumber();
  const whatsapp = whatsappHref("Hello YUSFAITH, I would like to ask about building materials.");

  return (
    <footer className="border-t-4 border-[#e15a12] bg-neutral text-neutral-content">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Wordmark tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-content/75">
            Cement and building materials for contractors, retailers, developers, and wholesale buyers in Nigeria.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-content/75">Explore</p>
          <ul className="mt-3 grid gap-2 text-sm">
            {publicLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            {enquiryLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-content/75">Contact</p>
          <div className="mt-3 grid gap-2 text-sm text-neutral-content/75">
            {email ? <a href={`mailto:${email}`}>{email}</a> : <p>Email placeholder until the company supplies one.</p>}
            {whatsapp && phone ? (
              <a href={whatsapp} target="_blank" rel="noreferrer">
                WhatsApp {phone}
              </a>
            ) : (
              <p>WhatsApp placeholder until a business number is configured.</p>
            )}
            <p>Social profiles will be linked here when the company supplies them.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
