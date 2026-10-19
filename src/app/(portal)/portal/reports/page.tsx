import { AccessState } from "@/components/portal/access-state";
import { PortalPageHeader } from "@/components/portal/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/ui/empty-state";
import { allowDemoDashboard } from "@/lib/portal/demo";
import { isClerkConfigured } from "@/lib/portal/clerk";
import { defaultDashboardRange, loadDashboard } from "@/server/dashboard";
import { authorizeSection } from "@/server/portal-session";

export default async function ReportsPage() {
  const access = await authorizeSection("reports");
  if (access.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl">
        <AccessState result={access} />
      </div>
    );
  }

  const range = defaultDashboardRange();
  const data = await loadDashboard({
    role: access.actor.role,
    customerId: access.actor.customerId,
    demo: allowDemoDashboard() && !isClerkConfigured(),
    from: range.from,
    to: range.to,
    status: null,
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title="Reports"
        description={
          data
            ? `Operating summary for ${data.branchName}, ${range.from} to ${range.to}. Order value is the sum of stored subtotals, not paid revenue.`
            : "Operating summary for the active yard."
        }
      />
      {!data ? (
        <div className="mt-6">
          <EmptyState
            title="No single active branch"
            description="Reports stay closed until one yard is active, so figures from different branches are not mixed."
          />
        </div>
      ) : (
        <>
          {data.demo ? (
            <p className="mt-4 border border-line bg-base-200 px-4 py-3 text-sm leading-6 text-base-content/80">
              These figures come from stored demo records. Sample prices are not current market prices.
            </p>
          ) : null}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
          <section className="mt-8 border border-line bg-base-100">
            <h2 className="border-b border-line px-4 py-3 font-display text-2xl text-ink">Orders by status</h2>
            {data.statusCounts.length === 0 ? (
              <p className="px-4 py-6 text-sm text-base-content/70">No orders in this month-to-date range.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-base-content/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {data.statusCounts.map((row) => (
                    <tr key={row.status} className="border-t border-line">
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
