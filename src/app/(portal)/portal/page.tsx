import { Suspense } from "react";
import Link from "next/link";
import { AccessState } from "@/components/portal/access-state";
import { DashboardFilters } from "@/components/portal/dashboard-filters";
import { QuantityChart, StatusChart, TrendChart } from "@/components/portal/dashboard-charts";
import { PortalPageHeader } from "@/components/portal/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { ChartPanel } from "@/components/ui/chart-panel";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { getDashboard, type DashboardData } from "@/server/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}) {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}) {
  const params = await searchParams;
  const result = await getDashboard(params);

  return (
    <div className="mx-auto max-w-6xl">
      <PortalPageHeader
        title="Yard overview"
        description="Figures are calculated from stored orders, customers, products, and stock. Order value is not paid revenue."
        action={
          <Link href="/portal/orders" className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
            Open orders
          </Link>
        }
      />
      {result.kind !== "ready" ? (
        <div className="mt-6">
          {result.kind === "no-branch" ? (
            <EmptyState
              title="No single active branch"
              description="The dashboard shows one active branch. Assign branch access before combining figures from more than one yard."
            />
          ) : (
            <AccessState result={result.access} />
          )}
        </div>
      ) : (
        <DashboardBody data={result.data} />
      )}
    </div>
  );
}

function DashboardBody({ data }: { data: DashboardData }) {
  return (
    <>
      {data.demo ? (
        <p className="mt-4 border border-line bg-base-200 px-4 py-3 text-sm leading-6 text-base-content/80">
          Demo data is turned on with PORTAL_ALLOW_DEMO_DATA. These figures come from stored demo records for {data.branchName}, not from a signed-in Clerk session, and the sample prices are not current market prices.
        </p>
      ) : null}
      {data.notice ? <p className="mt-4 text-sm leading-6 text-base-content/70">{data.notice}</p> : null}
      <DashboardFilters from={data.from} to={data.to} status={data.status} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Order value by day" description="Each bar is the sum of qualifying order subtotals. A day is counted once.">
          {data.trend.length ? <TrendChart data={data.trend} /> : <ChartEmpty title="No order value in this range" />}
        </ChartPanel>
        <ChartPanel title="Orders by status" description="Counts of stored orders in the selected dates for this branch.">
          {data.statusCounts.length ? <StatusChart data={data.statusCounts} /> : <ChartEmpty title="No orders in this range" />}
        </ChartPanel>
      </div>
      <div className="mt-4">
        <ChartPanel title="Top products by quantity" description="Sum of line quantities on the orders included above. Catalogue price is not used.">
          {data.topProducts.length ? <QuantityChart data={data.topProducts} /> : <ChartEmpty title="No product quantities in this range" />}
        </ChartPanel>
      </div>
      {data.showOrders ? (
        <section className="mt-8">
          <SectionTitle title="Recent orders" href="/portal/orders" />
          <div className="mt-4">
            <DataTable
              columns={[
                { id: "number", header: "Order", cell: (row) => <Link href={`/portal/orders/${row.id}`} className="text-ink hover:text-primary">{row.number}</Link> },
                { id: "customer", header: "Customer", cell: (row) => row.customer },
                { id: "date", header: "Order date", cell: (row) => row.orderDate },
                { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} kind="order" /> },
                { id: "value", header: "Order value", cell: (row) => row.value },
              ]}
              rows={data.recentOrders}
              getRowKey={(row) => row.id}
              empty={<EmptyState title="No orders in this range" description="Change the dates or status to see other stored orders." />}
            />
          </div>
        </section>
      ) : null}
      {data.lowStock ? (
        <section className="mt-8">
          <SectionTitle title="Low stock" href="/portal/inventory" />
          <div className="mt-4">
            <DataTable
              columns={[
                { id: "product", header: "Product", cell: (row) => row.product },
                { id: "warehouse", header: "Warehouse", cell: (row) => row.warehouse },
                { id: "onHand", header: "On hand", cell: (row) => `${row.onHand} ${row.unit.toLowerCase()}` },
                { id: "reorder", header: "Reorder level", cell: (row) => row.reorder },
              ]}
              rows={data.lowStock}
              getRowKey={(row) => row.id}
              empty={<EmptyState title="No low-stock products" description="Every stocked product in this branch is above its reorder level." />}
            />
          </div>
        </section>
      ) : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {data.quotes ? (
          <section>
            <SectionTitle title="Recent quotations" href="/portal/quotes" />
            <div className="mt-4">
              <DataTable
                columns={[
                  { id: "number", header: "Quote", cell: (row) => <Link href={`/portal/quotes/${row.id}`} className="text-ink hover:text-primary">{row.number}</Link> },
                  { id: "customer", header: "Customer", cell: (row) => row.customer },
                  { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} kind="quote" /> },
                  { id: "value", header: "Value", cell: (row) => row.value },
                ]}
                rows={data.quotes}
                getRowKey={(row) => row.id}
                empty={<EmptyState title="No quotations in this range" description="Quotations are included by the date they were recorded." />}
              />
            </div>
          </section>
        ) : null}
        {data.enquiries ? (
          <section>
            <SectionTitle title="Recent enquiries" />
            <div className="mt-4">
              <DataTable
                columns={[
                  { id: "business", header: "Business", cell: (row) => row.business },
                  { id: "kind", header: "Type", cell: (row) => <StatusBadge status={row.kind} /> },
                  { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
                  { id: "date", header: "Received", cell: (row) => row.createdAt },
                ]}
                rows={data.enquiries}
                getRowKey={(row) => row.id}
                empty={<EmptyState title="No enquiries in this range" description="Public enquiries appear here after they are stored." />}
              />
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}

function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {href ? (
        <Link href={href} className="text-sm text-ink hover:text-primary">
          View all
        </Link>
      ) : null}
    </div>
  );
}

function ChartEmpty({ title }: { title: string }) {
  return <p className="pt-16 text-center text-sm text-base-content/70">{title}</p>;
}

function DashboardFallback() {
  return (
    <div className="mx-auto grid max-w-6xl gap-4">
      <Skeleton className="h-12 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
