"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createOrderFromQuote } from "@/server/order-actions";

export function QuoteOrderButton({ quoteId }: { quoteId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="print:hidden">
      {message ? (
        <p role="alert" className="mb-3 text-sm text-error">
          {message}
        </p>
      ) : null}
      <button type="button" className="btn btn-primary h-11 min-h-11 rounded-sm px-5" onClick={() => setOpen(true)}>
        Create order
      </button>
      <ConfirmDialog
        open={open}
        title="Create an order from this quotation?"
        description="The order starts as Pending and keeps the quotation prices. It does not reduce on-hand stock."
        confirmLabel={pending ? "Saving…" : "Create order"}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          startTransition(async () => {
            const result = await createOrderFromQuote(quoteId);
            if (result && !result.ok) setMessage(result.message);
          });
        }}
      />
    </div>
  );
}
