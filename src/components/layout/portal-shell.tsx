"use client";

import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  PanelLeft,
  Settings,
  Users,
  Warehouse,
  X,
  FileText,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/cn";
import {
  navForRole,
  portalNav,
  portalRoles,
  roleLabels,
  sectionFromPath,
  type PortalRole,
  type PortalSection,
} from "@/lib/portal/access";
import type { PortalActor } from "@/server/portal-session";

const ClerkUserMenu = dynamic(
  () => import("@/components/portal/clerk-user-menu").then((mod) => mod.ClerkUserMenu),
  { ssr: false },
);

const icons: Record<PortalSection, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  orders: ClipboardList,
  products: Package,
  inventory: Warehouse,
  customers: Users,
  quotes: FileText,
  reports: BarChart3,
  settings: Settings,
};

export function PortalShell({
  actor,
  clerkEnabled,
  showRolePreview,
  children,
}: {
  actor: PortalActor | null;
  clerkEnabled: boolean;
  showRolePreview: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const [previewRole, setPreviewRole] = useState<PortalRole>("operations_manager");
  const drawerOpen = drawerPath === pathname;
  const role = showRolePreview ? previewRole : actor?.role ?? null;
  const items = navForRole(role);
  const section = sectionFromPath(pathname);
  const current = portalNav.find((item) => item.section === section) ?? portalNav[0];
  const crumbs = breadcrumbs(pathname, current.label);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className={cn("min-h-screen bg-base-200 lg:grid", collapsed ? "lg:grid-cols-[4.5rem_1fr]" : "lg:grid-cols-[16rem_1fr]")}>
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-ink">
        Skip to content
      </a>
      <aside className="hidden border-r border-neutral bg-neutral text-neutral-content print:hidden lg:flex lg:flex-col">
        <SidebarBody
          collapsed={collapsed}
          items={items}
          pathname={pathname}
          role={role}
          clerkEnabled={clerkEnabled}
          showRolePreview={showRolePreview}
          previewRole={previewRole}
          previewId="preview-role-desktop"
          onPreviewRole={setPreviewRole}
        />
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-base-100 print:hidden">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
            <button
              type="button"
              className="btn btn-ghost h-10 min-h-10 rounded-sm px-3 lg:hidden"
              aria-expanded={drawerOpen}
              aria-controls="portal-drawer"
              onClick={() => setDrawerPath(pathname)}
            >
              <Menu className="size-5" />
              <span className="sr-only">Open portal menu</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost hidden h-10 min-h-10 rounded-sm px-3 lg:inline-flex"
              aria-pressed={collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              <PanelLeft className="size-5" />
              <span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{current.label}</p>
              <div className="hidden sm:block">
                <Breadcrumbs items={crumbs} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {clerkEnabled ? (
                <ClerkUserMenu />
              ) : (
                <p className="max-w-36 truncate text-sm text-base-content/70">Not signed in</p>
              )}
            </div>
          </div>
        </header>
        <main id="content" className="px-4 py-8 lg:px-8">{children}</main>
      </div>
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 print:hidden lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            aria-label="Close portal menu"
            onClick={() => setDrawerPath(null)}
          />
          <div id="portal-drawer" className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-neutral text-neutral-content">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <Wordmark tone="light" href="/portal" />
              <button type="button" className="btn btn-ghost h-10 min-h-10 rounded-sm px-3 text-neutral-content" onClick={() => setDrawerPath(null)}>
                <X className="size-5" />
                <span className="sr-only">Close portal menu</span>
              </button>
            </div>
            <SidebarNav items={items} pathname={pathname} collapsed={false} />
            <RoleNote
              id="preview-role-mobile"
              clerkEnabled={clerkEnabled}
              showRolePreview={showRolePreview}
              role={role}
              previewRole={previewRole}
              onPreviewRole={setPreviewRole}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SidebarBody({
  collapsed,
  items,
  pathname,
  role,
  clerkEnabled,
  showRolePreview,
  previewRole,
  previewId,
  onPreviewRole,
}: {
  collapsed: boolean;
  items: ReturnType<typeof navForRole>;
  pathname: string;
  role: PortalRole | null;
  clerkEnabled: boolean;
  showRolePreview: boolean;
  previewRole: PortalRole;
  previewId: string;
  onPreviewRole: (role: PortalRole) => void;
}) {
  return (
    <>
      <div className={cn("border-b border-white/10 py-6", collapsed ? "px-3" : "px-6")}>
        <Wordmark href="/portal" compact={collapsed} />
      </div>
      <SidebarNav items={items} pathname={pathname} collapsed={collapsed} />
      {collapsed ? null : (
        <RoleNote
          id={previewId}
          clerkEnabled={clerkEnabled}
          showRolePreview={showRolePreview}
          role={role}
          previewRole={previewRole}
          onPreviewRole={onPreviewRole}
        />
      )}
    </>
  );
}

function SidebarNav({
  items,
  pathname,
  collapsed,
}: {
  items: ReturnType<typeof navForRole>;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <nav className="grid gap-1 px-3 py-4" aria-label="Portal">
      {items.map((item) => {
        const Icon = icons[item.section];
        const active = item.href === "/portal" ? pathname === "/portal" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-sm px-3 py-2 text-sm",
              active ? "bg-white/15 text-neutral-content" : "text-neutral-content/75 hover:bg-white/10 hover:text-neutral-content",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function RoleNote({
  id,
  clerkEnabled,
  showRolePreview,
  role,
  previewRole,
  onPreviewRole,
}: {
  id: string;
  clerkEnabled: boolean;
  showRolePreview: boolean;
  role: PortalRole | null;
  previewRole: PortalRole;
  onPreviewRole: (role: PortalRole) => void;
}) {
  if (clerkEnabled || !showRolePreview) {
    return (
      <p className="mt-auto px-6 py-6 text-xs leading-5 text-neutral-content/80">
        {role ? roleLabels[role] : "No portal role"} · Lagos Yard
      </p>
    );
  }

  return (
    <div className="mt-auto px-4 py-4">
      <label className="grid gap-2 text-xs text-neutral-content/70" htmlFor={id}>
        Navigation preview
        <select
          id={id}
          className="select h-10 min-h-10 rounded-sm border-white/15 bg-neutral text-sm text-neutral-content"
          value={previewRole}
          onChange={(event) => onPreviewRole(event.target.value as PortalRole)}
        >
          {portalRoles.map((entry) => (
            <option key={entry} value={entry}>
              {roleLabels[entry]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function breadcrumbs(pathname: string, label: string) {
  const crumbs = [{ label: "Portal", href: "/portal" }];
  if (pathname === "/portal") return [...crumbs, { label: "Overview" }];
  const parts = pathname.split("/").filter(Boolean);
  if (parts[1] === "orders" && parts[2]) {
    return [...crumbs, { label: "Orders", href: "/portal/orders" }, { label: parts[2] }];
  }
  return [...crumbs, { label }];
}
