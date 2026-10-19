import { cn } from "@/lib/cn";
import { orderStatusLabel, quoteStatusLabel } from "@/lib/commerce/workflow-labels";

const labels: Record<string, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Approved",
  PICKING: "Processing",
  READY: "Ready for Dispatch",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Rejected",
  EXPIRED: "Expired",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING: "Pending",
  NEW: "New",
  REVIEWING: "Reviewing",
  REPLIED: "Replied",
  CLOSED: "Closed",
  QUOTE: "Quote",
  ACCOUNT: "Account",
  CONTACT: "Contact",
  confirmed: "Confirmed",
  picking: "Picking",
  ready: "Ready",
  dispatched: "Dispatched",
};

const tones: Record<string, string> = {
  DRAFT: "bg-base-300 text-base-content",
  CONFIRMED: "bg-[#e7eef3] text-info",
  PICKING: "bg-[#f8efe2] text-warning",
  READY: "bg-[#e5f0ea] text-success",
  DISPATCHED: "bg-base-300 text-base-content",
  DELIVERED: "bg-[#e5f0ea] text-success",
  CANCELLED: "bg-[#f6e6e2] text-error",
  ACTIVE: "bg-[#e5f0ea] text-success",
  INACTIVE: "bg-base-300 text-base-content",
  PENDING: "bg-[#f8efe2] text-warning",
  SENT: "bg-[#e7eef3] text-info",
  ACCEPTED: "bg-[#e5f0ea] text-success",
  DECLINED: "bg-[#f6e6e2] text-error",
  EXPIRED: "bg-base-300 text-base-content",
  NEW: "bg-[#f8efe2] text-warning",
  REVIEWING: "bg-[#e7eef3] text-info",
  REPLIED: "bg-[#e5f0ea] text-success",
  CLOSED: "bg-base-300 text-base-content",
  confirmed: "bg-[#e7eef3] text-info",
  picking: "bg-[#f8efe2] text-warning",
  ready: "bg-[#e5f0ea] text-success",
  dispatched: "bg-base-300 text-base-content",
};

export function StatusBadge({ status, kind }: { status: string; kind?: "order" | "quote" }) {
  const label =
    kind === "order" ? orderStatusLabel(status) : kind === "quote" ? quoteStatusLabel(status) : labels[status] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium tracking-wide",
        tones[status] ?? "bg-base-300 text-base-content",
      )}
    >
      {label}
    </span>
  );
}
