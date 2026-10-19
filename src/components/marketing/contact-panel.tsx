import Link from "next/link";
import { contactEmail, whatsappHref, whatsappNumber } from "@/lib/contact";
import { ButtonLink } from "@/components/ui/button";

export function ContactPanel() {
  const email = contactEmail();
  const phone = whatsappNumber();
  const whatsapp = whatsappHref("Hello YUSFAITH, I would like to ask about building materials.");

  return (
    <div className="grid gap-6 border border-line bg-base-100 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-base-content/55">Email</p>
        {email ? (
          <a className="mt-2 block text-lg text-ink" href={`mailto:${email}`}>
            {email}
          </a>
        ) : (
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Placeholder: add NEXT_PUBLIC_CONTACT_EMAIL when the company email is ready.
          </p>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-base-content/55">WhatsApp</p>
        {whatsapp && phone ? (
          <a className="mt-2 block text-lg text-ink" href={whatsapp} target="_blank" rel="noreferrer">
            Message {phone}
          </a>
        ) : (
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Placeholder: add NEXT_PUBLIC_WHATSAPP_NUMBER to show the business WhatsApp link.
          </p>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-base-content/55">Yard address</p>
        <p className="mt-2 text-sm leading-6 text-base-content/70">
          Placeholder: a street address has not been supplied. Do not treat the Lagos yard label as a published location.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/quote">Request a quote</ButtonLink>
        <Link href="/account" className="btn btn-outline h-11 min-h-11 rounded-sm border-neutral px-5 text-sm">
          Apply for an account
        </Link>
      </div>
    </div>
  );
}
