import { getDb } from "@/lib/db";
import type { PortalSection } from "@/lib/portal/access";
import { assertPortalAccess } from "@/server/portal-session";

export async function salesActor(section: PortalSection) {
  const actor = await assertPortalAccess(section);
  const profile = await getDb().userProfile.findUnique({ where: { clerkUserId: actor.userId } });
  if (!profile?.active) return null;
  return { actor, profile };
}

export async function nextDocumentNumber(prefix: string, exists: (number: string) => Promise<boolean>) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const stamp = new Date();
    const number = `${prefix}-${stamp.getUTCFullYear()}${String(stamp.getUTCMonth() + 1).padStart(2, "0")}${String(stamp.getUTCDate()).padStart(2, "0")}-${String(stamp.getUTCHours()).padStart(2, "0")}${String(stamp.getUTCMinutes()).padStart(2, "0")}${String(stamp.getUTCSeconds()).padStart(2, "0")}${attempt}`;
    if (!(await exists(number))) return number;
  }
  throw new Error("A unique document number could not be assigned.");
}
