import { Suspense } from "react";
import { AccessState } from "@/components/portal/access-state";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/lib/db";
import { requireSingleBranch } from "@/server/branch";
import { authorizeSection } from "@/server/portal-session";

export default function SettingsPage() {
  return (
    <Suspense>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const access = await authorizeSection("settings");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }

  const branch = await requireSingleBranch();
  const warehouses = branch
    ? await getDb().warehouse.findMany({
        where: { branchId: branch.id },
        orderBy: { name: "asc" },
        select: { id: true, name: true, location: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title="Settings"
        description="Yard profile for this deployment. Roles are stored on UserProfile and are not edited from this screen."
      />
      {!branch ? (
        <div className="mt-6">
          <EmptyState
            title="No single active branch"
            description="Settings shows one active yard. More than one active branch is left unchanged so locations are not mixed."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="border border-line bg-base-100 p-6">
            <h2 className="font-display text-2xl text-ink">{branch.name}</h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">Code</dt>
                <dd className="mt-1 text-ink">{branch.code}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">Address</dt>
                <dd className="mt-1 text-ink">{branch.address}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-base-content/60">Record</dt>
                <dd className="mt-1 text-ink">{branch.isDemo ? "Sample yard data" : "Operating yard"}</dd>
              </div>
            </dl>
          </section>
          <section className="border border-line bg-base-100 p-6">
            <h2 className="font-display text-2xl text-ink">Warehouses</h2>
            {warehouses.length === 0 ? (
              <p className="mt-4 text-sm text-base-content/70">No warehouses are stored for this yard.</p>
            ) : (
              <ul className="mt-4 grid gap-3 text-sm">
                {warehouses.map((warehouse) => (
                  <li key={warehouse.id} className="border-t border-line pt-3">
                    <p className="text-ink">{warehouse.name}</p>
                    <p className="text-base-content/70">{warehouse.location}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-6 text-sm leading-6 text-base-content/70">
              A signed-in person receives access only after a Super Admin creates a UserProfile for their Clerk user id. Changing a profile field in Clerk does not change the role.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
