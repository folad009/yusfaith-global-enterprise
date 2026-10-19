import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { isClerkConfigured } from "@/lib/portal/clerk";
import { getPortalActor } from "@/server/portal-session";

export const metadata: Metadata = {
  title: "Operations portal",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const actor = await getPortalActor();
  return (
    <Suspense fallback={<div className="min-h-screen bg-base-200" />}>
      <PortalShell
        actor={actor}
        clerkEnabled={isClerkConfigured()}
        showRolePreview={process.env.NODE_ENV !== "production" && !isClerkConfigured()}
      >
        {children}
      </PortalShell>
    </Suspense>
  );
}
