import { auth, currentUser } from "@clerk/nextjs/server";
import type { UserRole } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import {
  canAccess,
  type PortalRole,
  type PortalSection,
} from "@/lib/portal/access";
import { allowDemoDashboard } from "@/lib/portal/demo";
import { isClerkConfigured } from "@/lib/portal/clerk";

export type PortalActor = {
  userId: string;
  profileId: string | null;
  role: PortalRole | null;
  name: string;
  customerId: string | null;
  active: boolean;
  provisioned: boolean;
};

export type AccessResult =
  | { status: "ok"; actor: PortalActor & { role: PortalRole; active: true; provisioned: true } }
  | { status: "unconfigured" }
  | { status: "unauthenticated" }
  | { status: "unprovisioned"; actor: PortalActor }
  | { status: "inactive"; actor: PortalActor }
  | { status: "forbidden"; actor: PortalActor };

const roleFromDatabase: Record<UserRole, PortalRole> = {
  SUPER_ADMIN: "super_admin",
  OPERATIONS_MANAGER: "operations_manager",
  SALES_OFFICER: "sales_officer",
  WAREHOUSE_OFFICER: "warehouse_officer",
  WHOLESALE_CUSTOMER: "wholesale_customer",
};

function displayName(user: { firstName: string | null; lastName: string | null; username: string | null } | null) {
  if (!user) return "Signed-in user";
  const combined = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return combined || user.username || "Signed-in user";
}

export async function getPortalActor(): Promise<PortalActor | null> {
  if (!isClerkConfigured()) return null;
  try {
    const session = await auth();
    if (!session.userId) return null;
    const user = await currentUser();
    const name = displayName(user);
    const email = user?.primaryEmailAddress?.emailAddress ?? "";
    const profile = await getDb().userProfile.findUnique({ where: { clerkUserId: session.userId } });
    if (!profile) {
      return {
        userId: session.userId,
        profileId: null,
        role: null,
        name,
        customerId: null,
        active: false,
        provisioned: false,
      };
    }
    if ((email && profile.email !== email) || profile.name !== name) {
      await getDb().userProfile.update({
        where: { id: profile.id },
        data: { name, ...(email ? { email } : {}) },
      });
    }
    return {
      userId: session.userId,
      profileId: profile.id,
      role: roleFromDatabase[profile.role],
      name,
      customerId: profile.customerId,
      active: profile.active,
      provisioned: true,
    };
  } catch {
    return null;
  }
}

export async function requirePortalAccess(section: PortalSection): Promise<AccessResult> {
  if (!isClerkConfigured()) return { status: "unconfigured" };
  const actor = await getPortalActor();
  if (!actor) return { status: "unauthenticated" };
  if (!actor.provisioned || !actor.role) return { status: "unprovisioned", actor };
  if (!actor.active) return { status: "inactive", actor };
  if (!canAccess(actor.role, section)) return { status: "forbidden", actor };
  return { status: "ok", actor: { ...actor, role: actor.role, active: true, provisioned: true } };
}

export async function authorizeSection(section: PortalSection): Promise<AccessResult> {
  const access = await requirePortalAccess(section);
  if (access.status === "ok") return access;
  if (access.status === "unconfigured" && allowDemoDashboard()) {
    const actor = {
      userId: "demo-clerk-not-a-real-user",
      profileId: null,
      role: "operations_manager" as const,
      name: "Demo Operations Manager",
      customerId: null,
      active: true as const,
      provisioned: true as const,
    };
    if (canAccess(actor.role, section)) return { status: "ok", actor };
    return { status: "forbidden", actor };
  }
  return access;
}

export async function assertPortalAccess(section: PortalSection) {
  const access = await authorizeSection(section);
  if (access.status === "ok") return access.actor;
  if (access.status === "unconfigured") throw new Error("Clerk is not configured");
  if (access.status === "unauthenticated") throw new Error("Not authenticated");
  if (access.status === "unprovisioned") throw new Error("This account has no portal profile");
  if (access.status === "inactive") throw new Error("This portal profile is inactive");
  throw new Error("You do not have access to this action");
}
