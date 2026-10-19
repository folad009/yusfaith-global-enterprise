export const orderStatusLabels = {
  DRAFT: "Pending",
  CONFIRMED: "Approved",
  PICKING: "Processing",
  READY: "Ready for Dispatch",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export const quoteStatusLabels = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Rejected",
  EXPIRED: "Expired",
} as const;

export type OrderWorkflowStatus = keyof typeof orderStatusLabels;
export type QuoteWorkflowStatus = keyof typeof quoteStatusLabels;

export function orderStatusLabel(status: string) {
  return status in orderStatusLabels ? orderStatusLabels[status as OrderWorkflowStatus] : status;
}

export function quoteStatusLabel(status: string) {
  return status in quoteStatusLabels ? quoteStatusLabels[status as QuoteWorkflowStatus] : status;
}

export function isOrderWorkflowStatus(value: string): value is OrderWorkflowStatus {
  return value in orderStatusLabels;
}

export function isQuoteWorkflowStatus(value: string): value is QuoteWorkflowStatus {
  return value in quoteStatusLabels;
}

export function formatNgn(value: string | number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(value));
}
