"use client";

import { useMemo, useState } from "react";
import type { OrderStatus, SampleOrder } from "@/lib/sample-data";
import { orders as sampleOrders } from "@/lib/sample-data";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { SelectInput } from "@/components/ui/field";
import { ToastViewport, type ToastMessage } from "@/components/ui/toast";

const pageSize = 5;

const columns: Column<SampleOrder>[] = [
  { id: "id", header: "Order", cell: (row) => <span className="font-medium">{row.id}</span> },
  { id: "customer", header: "Customer", cell: (row) => row.customer },
  { id: "product", header: "Product", cell: (row) => row.product },
  { id: "quantity", header: "Quantity", cell: (row) => row.quantity },
  { id: "yard", header: "Yard", cell: (row) => row.yard },
  { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
];

export function OrdersPanel() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sampleOrders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const matchesQuery =
        needle.length === 0 ||
        order.customer.toLowerCase().includes(needle) ||
        order.id.toLowerCase().includes(needle) ||
        order.product.toLowerCase().includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section id="orders" className="mt-8 grid gap-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-3xl text-ink">Open yard orders</h2>
          <p className="mt-1 text-sm text-base-content/70">Sample orders for the Lagos yard.</p>
        </div>
        <Button type="button" onClick={() => setConfirmOpen(true)}>
          Confirm dispatch
        </Button>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <SearchField
          placeholder="Search order, customer, or product"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        <label className="grid gap-1 text-sm md:w-52">
          <span className="sr-only">Filter by status</span>
          <SelectInput
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as OrderStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="picking">Picking</option>
            <option value="ready">Ready</option>
            <option value="dispatched">Dispatched</option>
          </SelectInput>
        </label>
      </div>
      <DataTable
        columns={columns}
        rows={visible}
        getRowKey={(row) => row.id}
        empty={
          <EmptyState
            title="No orders match"
            description="Adjust the search or status filter to see the sample yard orders again."
          />
        }
      />
      <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
      <ConfirmDialog
        open={confirmOpen}
        title="Mark the next ready order as dispatched?"
        description="This demonstration updates nothing in the database. It confirms the dispatch action a warehouse officer would take."
        confirmLabel="Dispatch"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>
          setToasts((current) => [
            {
              id: crypto.randomUUID(),
              title: "Dispatch noted",
              body: "Sample action only. Order YF-1047 would move to dispatched.",
            },
            ...current,
          ])
        }
      />
      <ToastViewport
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </section>
  );
}
