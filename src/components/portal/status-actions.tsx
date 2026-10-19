"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { orderStatusLabel, quoteStatusLabel } from "@/lib/commerce/workflow-labels";
import { setOrderStatus, type OrderActionResult } from "@/server/order-actions";
import { setQuoteStatus, type QuoteActionResult } from "@/server/quote-actions";

export function QuoteStatusActions({ id, moves }: { id: string; moves: string[] }) {
  return (
    <StatusChoices
      moves={moves}
      labelFor={quoteStatusLabel}
      run={(status) => setQuoteStatus(id, status as "SENT")}
    />
  );
}

export function OrderStatusActions({ id, moves }: { id: string; moves: string[] }) {
  return (
    <StatusChoices
      moves={moves}
      labelFor={orderStatusLabel}
      run={(status, reason) => setOrderStatus(id, status as "CONFIRMED", reason)}
      requireReason={(status) => status === "CANCELLED"}
    />
  );
}

function StatusChoices({
  moves,
  labelFor,
  run,
  requireReason,
}: {
  moves: string[];
  labelFor: (status: string) => string;
  run: (status: string, reason: string) => Promise<QuoteActionResult | OrderActionResult | void>;
  requireReason?: (status: string) => boolean;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (moves.length === 0) return null;
  const needsReason = choice ? Boolean(requireReason?.(choice)) : false;

  return (
    <div className="print:hidden">
      {message ? (
        <p role="alert" className="mb-3 text-sm text-error">
          {message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {moves.map((status) => (
          <button
            key={status}
            type="button"
            className="btn btn-secondary h-11 min-h-11 rounded-sm px-4"
            onClick={() => {
              setChoice(status);
              setMessage(null);
              setConfirming(!requireReason?.(status));
            }}
          >
            Mark {labelFor(status)}
          </button>
        ))}
      </div>
      {choice && needsReason && !confirming ? (
        <div className="mt-3 grid max-w-xl gap-3">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-ink">Cancellation reason</span>
            <textarea className="textarea min-h-24 rounded-sm border-base-300" value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
          <button
            type="button"
            className="btn btn-primary h-11 min-h-11 w-fit rounded-sm px-4"
            onClick={() => {
              if (reason.trim().length < 3) {
                setMessage("Enter a cancellation reason.");
                return;
              }
              setConfirming(true);
            }}
          >
            Continue
          </button>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirming && choice !== null}
        title={choice ? `Mark this ${labelFor(choice)}?` : "Confirm"}
        description="The change is checked on the server and written to the audit log."
        confirmLabel={pending ? "Saving…" : "Confirm"}
        onClose={() => {
          setConfirming(false);
          setChoice(null);
        }}
        onConfirm={() => {
          if (!choice) return;
          const next = choice;
          startTransition(async () => {
            const result = await run(next, reason);
            if (result && !result.ok) setMessage(result.message);
          });
        }}
      />
    </div>
  );
}
