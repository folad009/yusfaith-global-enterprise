import { orderStatuses } from "@/lib/commerce/dashboard-rules";
import { orderStatusLabel } from "@/lib/commerce/workflow-labels";

export function DashboardFilters({
  from,
  to,
  status,
}: {
  from: string;
  to: string;
  status: string | null;
}) {
  return (
    <form method="get" className="mt-6 flex flex-col gap-3 border border-line bg-base-100 p-4 sm:flex-row sm:items-end">
      <label className="grid gap-1 text-sm text-base-content/70">
        From
        <input type="date" name="from" defaultValue={from} className="input h-11 rounded-sm border-base-300" required />
      </label>
      <label className="grid gap-1 text-sm text-base-content/70">
        To
        <input type="date" name="to" defaultValue={to} className="input h-11 rounded-sm border-base-300" required />
      </label>
      <label className="grid gap-1 text-sm text-base-content/70">
        Order status
        <select name="status" defaultValue={status ?? ""} className="select h-11 min-h-11 rounded-sm border-base-300">
          <option value="">All statuses</option>
          {orderStatuses.map((entry) => (
            <option key={entry} value={entry}>
              {orderStatusLabel(entry)}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-primary h-11 min-h-11 rounded-sm px-5">
        Apply
      </button>
    </form>
  );
}
