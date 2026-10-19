import { allowUnauthenticatedDemo } from "@/lib/portal/permissions";

export function allowDemoDashboard() {
  return allowUnauthenticatedDemo();
}
