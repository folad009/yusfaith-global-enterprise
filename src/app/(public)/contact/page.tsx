import type { Metadata } from "next";
import { ContactPanel } from "@/components/marketing/contact-panel";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact YUSFAITH GLOBAL ENTERPRISES about cement and building materials.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to the sales desk.">
        Use the quotation form for product enquiries. Phone, email, and address appear here only after they are configured. Nothing on this page is an invented contact detail.
      </PageHeader>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <ContactPanel />
      </section>
    </>
  );
}
