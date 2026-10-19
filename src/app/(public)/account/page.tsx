import type { Metadata } from "next";
import { AccountForm } from "@/components/marketing/account-form";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Wholesale account application",
  description: "Apply for a wholesale buying account with YUSFAITH GLOBAL ENTERPRISES.",
};

export default function AccountPage() {
  return (
    <>
      <PageHeader eyebrow="Accounts" title="Apply for a wholesale account.">
        Repeat buyers can send their business details. The application is stored for review. It does not open an account by itself.
      </PageHeader>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <AccountForm />
      </section>
    </>
  );
}
