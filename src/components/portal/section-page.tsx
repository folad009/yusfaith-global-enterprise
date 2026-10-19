import { AccessState } from "@/components/portal/access-state";
import { ListToolbar } from "@/components/portal/list-toolbar";
import { PortalPageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { portalNav, type PortalSection } from "@/lib/portal/access";
import { requirePortalAccess } from "@/server/portal-session";

const listSections = new Set<PortalSection>(["orders", "products", "inventory", "customers", "quotes"]);

export async function PortalSectionPage({ section }: { section: PortalSection }) {
  const access = await requirePortalAccess(section);
  const item = portalNav.find((entry) => entry.section === section);
  if (!item) return null;

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title={item.label}
        description={item.description}
        action={
          access.status === "ok" ? (
            <button type="button" className="btn btn-primary h-11 min-h-11 rounded-sm px-5" disabled>
              {item.action}
            </button>
          ) : null
        }
      />
      {access.status === "forbidden" ? (
        <div className="mt-6">
          <AccessState result={access} />
        </div>
      ) : (
        <>
          {listSections.has(section) ? <ListToolbar searchPlaceholder={`Search ${item.label.toLowerCase()}`} /> : null}
          <div className="mt-6">
            {access.status === "ok" ? (
              <EmptyState
                title={`${item.label} is not built yet`}
                description="The route, header, and access check are in place. Records for this section will be loaded through the portal data layer in a later pass."
              />
            ) : (
              <AccessState result={access} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
