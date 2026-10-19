import { getDb } from "@/lib/db";

export async function requireSingleBranch() {
  const branches = await getDb().branch.findMany({
    where: { active: true },
    orderBy: { code: "asc" },
  });
  if (branches.length !== 1) return null;
  return branches[0];
}
