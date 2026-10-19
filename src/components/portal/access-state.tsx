import Link from "next/link";
import { roleLabels, type PortalRole } from "@/lib/portal/access";
import type { AccessResult } from "@/server/portal-session";

export function AccessState({ result }: { result: Exclude<AccessResult, { status: "ok" }> }) {
  if (result.status === "unconfigured") return <ClerkSetup />;
  if (result.status === "unprovisioned") {
    return (
      <section className="border border-line bg-base-100 px-6 py-12">
        <h1 className="font-display text-3xl text-ink">Portal profile required</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/70">
          Signed in as {result.actor.name}. This Clerk user has no YUSFAITH profile yet. A Super Admin assigns the role in the UserProfile table. The role is not taken from account fields the user can edit.
        </p>
      </section>
    );
  }
  if (result.status === "inactive") {
    return (
      <section className="border border-line bg-base-100 px-6 py-12">
        <h1 className="font-display text-3xl text-ink">This profile is inactive</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/70">
          Signed in as {result.actor.name}. An inactive profile cannot open portal records or make changes. Sign out, or ask a Super Admin to reactivate the profile.
        </p>
      </section>
    );
  }
  if (result.status === "unauthenticated") {
    return (
      <section className="border border-line bg-base-100 px-6 py-12">
        <h1 className="font-display text-3xl text-ink">Sign in required</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/70">
          This page is available after a Clerk session is established. The dashboard at /portal is the first screen after sign-in.
        </p>
        <Link href="/sign-in" className="btn btn-primary mt-6 h-11 min-h-11 rounded-sm px-5">
          Sign in
        </Link>
      </section>
    );
  }

  const role = result.actor.role ? roleLabels[result.actor.role] : "No portal role";
  return (
    <section className="border border-line bg-base-100 px-6 py-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-base-content/60">
        Permission denied
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">This section is closed for your role</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/70">
        Signed in as {result.actor.name}. Current role: {role}. The menu hides this section, and the server also refuses the underlying records and changes.
      </p>
    </section>
  );
}

function ClerkSetup() {
  return (
    <section className="border border-line bg-base-100 px-6 py-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
        Authentication setup
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">Clerk is not configured</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/70">
        The portal checks every protected route on the server. Until Clerk keys are present, those checks fail closed and sample operating records stay unavailable. Add the values below to the environment, then restart the dev server.
      </p>
      <ol className="mt-6 grid gap-3 text-sm leading-6 text-ink">
        <li>1. Create a Clerk application and copy the publishable key and secret key.</li>
        <li>2. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.</li>
        <li>3. Set NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in and NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up.</li>
        <li>4. Set NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/portal and the same path for sign-up.</li>
        <li>5. Restart the dev server after the keys are saved.</li>
        <li>
          6. Create a UserProfile row for the Clerk user id. Set role to SUPER_ADMIN, OPERATIONS_MANAGER, SALES_OFFICER, WAREHOUSE_OFFICER, or WHOLESALE_CUSTOMER. For a wholesale user, also set customerId to that buyer&apos;s customer id.
        </li>
      </ol>
      <p className="mt-6 text-sm leading-6 text-base-content/70">
        The navigation preview in the sidebar only changes which links are visible. It does not sign anyone in and cannot load dashboard records.
      </p>
    </section>
  );
}

export function roleLabel(role: PortalRole | null) {
  return role ? roleLabels[role] : "No portal role";
}
