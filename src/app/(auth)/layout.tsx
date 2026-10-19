import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";
import { isClerkConfigured } from "@/lib/portal/clerk";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <ClerkSetupNotice />
      </main>
    );
  }
  return <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-16">{children}</main>;
}
